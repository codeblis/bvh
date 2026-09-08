import { NextResponse } from "next/server";
import { invalidRequest, persistenceUnavailable } from "@/lib/api-response";
import { createReference, escapeHtml, newsletterSchema } from "@/lib/forms";
import { readBoundedJson } from "@/lib/request";
import { emailConfig } from "@/lib/resend";
import { createServiceClient } from "@/lib/supabase/service";
import { deliverEmail } from "@/modules/forms/email.server";

export async function POST(request: Request) {
	const parsed = newsletterSchema.safeParse(await readBoundedJson(request));
	if (!parsed.success) return invalidRequest();

	const { email, nombre, perfil, source } = parsed.data;
	const reference = createReference("BVH-NEWS");
	let supabase: ReturnType<typeof createServiceClient>;
	try {
		supabase = createServiceClient();
	} catch {
		return persistenceUnavailable();
	}
	const persisted = await supabase
		.rpc("submit_newsletter_subscription", {
			p_email: email,
			p_full_name: nombre ?? "",
			p_profile: perfil ?? "",
			p_source: source ?? "sitio",
			p_reference: reference,
		})
		.single();
	if (persisted.error || !persisted.data) return persistenceUnavailable();

	if (!persisted.data.should_notify || !persisted.data.notification_token) {
		return NextResponse.json({ ok: true, alreadySubscribed: true });
	}

	const delivery = await deliverEmail(
		{
			from: emailConfig.from,
			to: emailConfig.to,
			subject: `[${reference}] Nueva suscripción BVH`,
			html: `<h1>Nueva suscripción</h1><p><strong>Email:</strong> ${escapeHtml(email)}</p><p><strong>Nombre:</strong> ${escapeHtml(nombre ?? "—")}</p><p><strong>Perfil:</strong> ${escapeHtml(perfil ?? "—")}</p><p><strong>Origen:</strong> ${escapeHtml(source ?? "sitio")}</p>`,
		},
		reference,
	);
	await supabase.rpc("record_form_notification", {
		p_resource_type: "newsletter_subscription",
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
		notification: delivery.success ? "sent" : "pending",
	});
}
