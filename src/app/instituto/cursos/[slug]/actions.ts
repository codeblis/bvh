"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createReference } from "@/lib/forms";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { deliverEmail } from "@/modules/forms/email.server";
import { enrollmentConfirmationEmail } from "@/modules/courses/notifications.server";
import { enrollmentFormSchema } from "@/modules/courses/schemas";

export async function enrollInCourse(formData: FormData) {
	const parsed = enrollmentFormSchema.safeParse({
		offeringId: String(formData.get("offeringId") ?? ""),
		courseSlug: String(formData.get("courseSlug") ?? ""),
	});
	if (!parsed.success) redirect("/instituto?error=invalid");

	const coursePath = `/instituto/cursos/${parsed.data.courseSlug}`;
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) {
		redirect(`/login?callbackUrl=${encodeURIComponent(coursePath)}`);
	}

	const reference = createReference("BVH-INS");
	const enrolled = await supabase
		.rpc("enroll_in_course", {
			p_offering_id: parsed.data.offeringId,
			p_reference: reference,
		})
		.single();
	if (enrolled.error || !enrolled.data) {
		const reason = enrolled.error?.message.includes("course_full")
			? "full"
			: "failed";
		redirect(`${coursePath}?enrollmentError=${reason}`);
	}

	// La plaza ya está confirmada en la base. Lo que siga con el correo no
	// puede quitársela al alumno: un fallo deja el aviso reintentable.
	if (enrolled.data.should_notify && enrolled.data.notification_token) {
		await notifyEnrollment({
			enrollmentId: enrolled.data.enrollment_id,
			notificationToken: enrolled.data.notification_token,
			offeringId: parsed.data.offeringId,
			reference,
			studentEmail: user.email ?? null,
			studentName:
				(user.user_metadata?.full_name as string | undefined) ?? null,
		});
	}

	revalidatePath("/cuenta");
	redirect(`${coursePath}?enrolled=true`);
}

async function notifyEnrollment(input: {
	enrollmentId: string;
	notificationToken: string;
	offeringId: string;
	reference: string;
	studentEmail: string | null;
	studentName: string | null;
}) {
	if (!input.studentEmail) return;

	let service: ReturnType<typeof createServiceClient>;
	try {
		service = createServiceClient();
	} catch {
		return;
	}

	const offering = await service
		.from("course_offerings")
		.select("starts_at, modality, location, courses(title)")
		.eq("id", input.offeringId)
		.maybeSingle();
	if (offering.error || !offering.data) return;

	const course = Array.isArray(offering.data.courses)
		? offering.data.courses[0]
		: offering.data.courses;

	const delivery = await deliverEmail(
		enrollmentConfirmationEmail({
			reference: input.reference,
			studentEmail: input.studentEmail,
			studentName: input.studentName,
			courseTitle: course?.title ?? "Instituto BVH",
			startsAt: offering.data.starts_at,
			modality: offering.data.modality,
			location: offering.data.location,
		}),
		input.reference,
	);

	await service.rpc("record_form_notification", {
		p_resource_type: "course_enrollment",
		p_resource_id: input.enrollmentId,
		p_notification_token: input.notificationToken,
		p_success: delivery.success,
		...(delivery.success
			? delivery.providerId
				? { p_provider_id: delivery.providerId }
				: {}
			: { p_error: delivery.error }),
	});
}
