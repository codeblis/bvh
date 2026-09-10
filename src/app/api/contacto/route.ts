import { NextResponse } from "next/server";
import {
	invalidRequest,
	persistenceUnavailable,
	tooManyRequests,
	verificationRequired,
} from "@/lib/api-response";
import { contactSchema, createReference, escapeHtml } from "@/lib/forms";
import { clientFingerprint, readBoundedJson } from "@/lib/request";
import { emailConfig } from "@/lib/resend";
import { createServiceClient } from "@/lib/supabase/service";
import { deliverEmail } from "@/modules/forms/email.server";
import { withinRateLimit } from "@/modules/forms/rate-limit.server";
import { verifyTurnstile } from "@/modules/forms/turnstile.server";

export async function POST(request: Request) {
	const body = await readBoundedJson(request);
	const parsed = contactSchema.safeParse(body);
	if (!parsed.success) return invalidRequest();

	// Primero el coste barato: quien excede el límite no llega a la base.
	const fingerprint = await clientFingerprint(request);
	let supabase: ReturnType<typeof createServiceClient>;
	try {
		supabase = createServiceClient();
	} catch {
		return persistenceUnavailable();
	}
	if (!(await withinRateLimit(supabase, fingerprint, "contacto"))) {
		return tooManyRequests();
	}

	const verified = await verifyTurnstile(
		(body as { turnstileToken?: string })?.turnstileToken,
		fingerprint,
	);
	if (!verified.ok) return verificationRequired();

	const { nombre, email, asunto, mensaje } = parsed.data;
	const reference = createReference("BVH-CON");
	const persisted = await supabase
		.rpc("submit_contact_message", {
			p_name: nombre,
			p_email: email,
			p_subject: asunto,
			p_message: mensaje,
			p_reference: reference,
		})
		.single();
	if (persisted.error || !persisted.data) return persistenceUnavailable();

	const delivery = await deliverEmail(
		{
			from: emailConfig.from,
			to: emailConfig.to,
			replyTo: email,
			subject: `[${reference}] ${asunto}`,
			html: `<h1>Nuevo contacto BVH</h1><p><strong>Nombre:</strong> ${escapeHtml(nombre)}</p><p><strong>Email:</strong> ${escapeHtml(email)}</p><p><strong>Asunto:</strong> ${escapeHtml(asunto)}</p><p>${escapeHtml(mensaje).replaceAll("\n", "<br>")}</p>`,
		},
		reference,
	);
	await supabase.rpc("record_form_notification", {
		p_resource_type: "contact_message",
		p_resource_id: persisted.data.submission_id,
		p_notification_token: persisted.data.notification_token,
		p_success: delivery.success,
		...(delivery.success
			? delivery.providerId
				? { p_provider_id: delivery.providerId }
				: {}
			: { p_error: delivery.error }),
	});

	return NextResponse.json({
		ok: true,
		reference,
		notification: delivery.success ? "sent" : "pending",
	});
}
