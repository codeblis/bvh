"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { createReference, escapeHtml } from "@/lib/forms";
import { emailConfig } from "@/lib/resend";
import { enrollmentConfirmationEmail } from "@/modules/courses/notifications.server";
import { deliverEmail } from "@/modules/forms/email.server";
import { notificationIdempotencyKey } from "@/modules/forms/idempotency";

const retrySchema = z.object({
	id: z.string().uuid(),
	resourceType: z.enum([
		"contact_message",
		"company_application",
		"newsletter_subscription",
		"course_enrollment",
	]),
});

function pathFor(resourceType: z.infer<typeof retrySchema>["resourceType"]) {
	if (resourceType === "contact_message") return "/admin/mensajes";
	if (resourceType === "company_application") return "/admin/solicitudes";
	if (resourceType === "course_enrollment")
		return "/admin/cursos/inscripciones";
	return "/admin/newsletter";
}

function first<T>(value: T | T[] | null): T | null {
	return Array.isArray(value) ? (value[0] ?? null) : value;
}

function resultPayload(
	delivery: Awaited<ReturnType<typeof deliverEmail>>,
	attempts: number,
) {
	return {
		notification_status: delivery.success ? "sent" : "failed",
		notification_attempts: attempts + 1,
		notification_last_error: delivery.success ? null : delivery.error,
		notification_provider_id: delivery.success ? delivery.providerId : null,
		notified_at: delivery.success ? new Date().toISOString() : null,
	};
}

export async function retryFormNotification(formData: FormData) {
	const parsed = retrySchema.safeParse({
		id: String(formData.get("id") ?? ""),
		resourceType: String(formData.get("resource_type") ?? ""),
	});
	if (!parsed.success) redirect("/admin?error=invalid-notification");

	const { id, resourceType } = parsed.data;
	const returnPath = pathFor(resourceType);
	const { supabase } = await requireAdmin();
	let outcome: "sent" | "failed";

	if (resourceType === "contact_message") {
		const read = await supabase
			.from("contact_messages")
			.select(
				"id, name, email, subject, message, reference, notification_attempts, notification_status",
			)
			.eq("id", id)
			.maybeSingle();
		if (read.error || !read.data) redirect(`${returnPath}?error=not-found`);
		if (read.data.notification_status === "sent") redirect(returnPath);

		const reference = read.data.reference ?? createReference("BVH-CON");
		const delivery = await deliverEmail(
			{
				from: emailConfig.from,
				to: emailConfig.to,
				replyTo: read.data.email,
				subject: `[${reference}] ${read.data.subject ?? "Contacto BVH"}`,
				html: `<h1>Nuevo contacto BVH</h1><p><strong>Nombre:</strong> ${escapeHtml(read.data.name)}</p><p><strong>Email:</strong> ${escapeHtml(read.data.email)}</p><p><strong>Asunto:</strong> ${escapeHtml(read.data.subject ?? "—")}</p><p>${escapeHtml(read.data.message).replaceAll("\n", "<br>")}</p>`,
			},
			notificationIdempotencyKey(
				reference,
				read.data.notification_status,
				read.data.notification_attempts,
			),
		);
		outcome = delivery.success ? "sent" : "failed";
		const update = await supabase
			.from("contact_messages")
			.update(resultPayload(delivery, read.data.notification_attempts))
			.eq("id", id);
		if (update.error) redirect(`${returnPath}?error=notification-state`);
	} else if (resourceType === "company_application") {
		const read = await supabase
			.from("company_applications")
			.select(
				"id, company_name, tax_id, legal_representative, corporate_email, phone, sector, founding_year, annual_revenue, employee_count, description, wants_advisor_contact, reference, notification_attempts, notification_status",
			)
			.eq("id", id)
			.maybeSingle();
		if (read.error || !read.data) redirect(`${returnPath}?error=not-found`);
		if (read.data.notification_status === "sent") redirect(returnPath);

		const reference = read.data.reference ?? createReference("BVH-RIE");
		const fields = Object.entries({
			empresa: read.data.company_name,
			idFiscal: read.data.tax_id,
			representante: read.data.legal_representative,
			email: read.data.corporate_email,
			teléfono: read.data.phone,
			sector: read.data.sector,
			fundación: read.data.founding_year,
			facturación: read.data.annual_revenue,
			empleados: read.data.employee_count,
			descripción: read.data.description,
			asesor: read.data.wants_advisor_contact,
		})
			.map(
				([key, value]) =>
					`<p><strong>${escapeHtml(key)}:</strong> ${escapeHtml(String(value ?? "—"))}</p>`,
			)
			.join("");
		const delivery = await deliverEmail(
			{
				from: emailConfig.from,
				to: emailConfig.to,
				replyTo: read.data.corporate_email,
				subject: `[${reference}] Solicitud RIE-BVH · ${read.data.company_name}`,
				html: `<h1>Nueva solicitud RIE-BVH</h1>${fields}`,
			},
			notificationIdempotencyKey(
				reference,
				read.data.notification_status,
				read.data.notification_attempts,
			),
		);
		outcome = delivery.success ? "sent" : "failed";
		const update = await supabase
			.from("company_applications")
			.update(resultPayload(delivery, read.data.notification_attempts))
			.eq("id", id);
		if (update.error) redirect(`${returnPath}?error=notification-state`);
	} else if (resourceType === "course_enrollment") {
		const read = await supabase
			.from("course_enrollments")
			.select(
				"id, reference, notification_attempts, notification_status, profiles(full_name, email), course_offerings(starts_at, modality, location, courses(title))",
			)
			.eq("id", id)
			.maybeSingle();
		if (read.error || !read.data) redirect(`${returnPath}?error=not-found`);
		if (read.data.notification_status === "sent") redirect(returnPath);

		const student = first(read.data.profiles);
		if (!student?.email) redirect(`${returnPath}?error=not-found`);

		const offering = first(read.data.course_offerings);
		const course = first(offering?.courses ?? null);
		// Se fija la referencia al reintentar para que la clave lógica del
		// proveedor no cambie entre un intento y el siguiente.
		const reference = read.data.reference ?? createReference("BVH-INS");
		const delivery = await deliverEmail(
			enrollmentConfirmationEmail({
				reference,
				studentEmail: student.email,
				studentName: student.full_name,
				courseTitle: course?.title ?? "Instituto BVH",
				startsAt: offering?.starts_at ?? null,
				modality: offering?.modality ?? null,
				location: offering?.location ?? null,
			}),
			notificationIdempotencyKey(
				reference,
				read.data.notification_status,
				read.data.notification_attempts,
			),
		);
		outcome = delivery.success ? "sent" : "failed";
		// La tabla no admite escritura directa ni siquiera desde el panel.
		const update = await supabase.rpc("record_enrollment_notification_retry", {
			p_enrollment_id: id,
			p_reference: reference,
			p_success: delivery.success,
			...(delivery.success
				? delivery.providerId
					? { p_provider_id: delivery.providerId }
					: {}
				: { p_error: delivery.error }),
		});
		if (update.error || update.data !== true) {
			redirect(`${returnPath}?error=notification-state`);
		}
	} else {
		// El aviso cuelga de la suscripción a una lista, no de la persona.
		const read = await supabase
			.from("newsletter_list_subscriptions")
			.select(
				"id, source, reference, notification_attempts, notification_status, newsletter_subscriptions(email, full_name, profile), newsletter_lists(name)",
			)
			.eq("id", id)
			.maybeSingle();
		if (read.error || !read.data) redirect(`${returnPath}?error=not-found`);
		if (read.data.notification_status === "sent") redirect(returnPath);

		const person = first(read.data.newsletter_subscriptions);
		if (!person?.email) redirect(`${returnPath}?error=not-found`);
		const list = first(read.data.newsletter_lists);

		const reference = read.data.reference ?? createReference("BVH-NEWS");
		const delivery = await deliverEmail(
			{
				from: emailConfig.from,
				to: emailConfig.to,
				subject: `[${reference}] Nueva suscripción BVH · ${list?.name ?? "lista"}`,
				html: `<h1>Nueva suscripción</h1><p><strong>Email:</strong> ${escapeHtml(person.email)}</p><p><strong>Nombre:</strong> ${escapeHtml(person.full_name ?? "—")}</p><p><strong>Lista:</strong> ${escapeHtml(list?.name ?? "—")}</p><p><strong>Perfil:</strong> ${escapeHtml(person.profile ?? "—")}</p><p><strong>Origen:</strong> ${escapeHtml(read.data.source ?? "sitio")}</p>`,
			},
			notificationIdempotencyKey(
				reference,
				read.data.notification_status,
				read.data.notification_attempts,
			),
		);
		outcome = delivery.success ? "sent" : "failed";
		const update = await supabase
			.from("newsletter_list_subscriptions")
			.update(resultPayload(delivery, read.data.notification_attempts))
			.eq("id", id);
		if (update.error) redirect(`${returnPath}?error=notification-state`);
	}

	revalidatePath(returnPath);
	revalidatePath("/admin");
	redirect(`${returnPath}?notification=${outcome}`);
}
