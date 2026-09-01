import { NextResponse } from "next/server";
import { invalidRequest, integrationUnavailable } from "@/lib/api-response";
import { createReference, escapeHtml, newsletterSchema } from "@/lib/forms";
import { emailConfig, getResendClient } from "@/lib/resend";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
	const parsed = newsletterSchema.safeParse(await request.json().catch(() => null));
	if (!parsed.success) return invalidRequest();

	const { email, nombre, perfil, source } = parsed.data;
	const reference = createReference("BVH-NEWS");

	let persisted = false;
	try {
		const supabase = await createClient();
		const { error } = await supabase.from("newsletter_subscriptions").upsert(
			{
				email,
				full_name: nombre,
				profile: perfil,
				source,
				is_active: true,
				unsubscribed_at: null,
			},
			{ onConflict: "email" },
		);
		persisted = !error;
	} catch {
		persisted = false;
	}

	let notified = false;
	const resend = getResendClient();
	if (resend) {
		const { error } = await resend.emails.send({
			from: emailConfig.from,
			to: emailConfig.to,
			replyTo: email,
			subject: `[${reference}] Nueva suscripción BVH`,
			html: `<h1>Nueva suscripción</h1><p><strong>Email:</strong> ${escapeHtml(email)}</p><p><strong>Nombre:</strong> ${escapeHtml(nombre ?? "—")}</p><p><strong>Perfil:</strong> ${escapeHtml(perfil ?? "—")}</p><p><strong>Origen:</strong> ${escapeHtml(source ?? "sitio")}</p>`,
		});
		notified = !error;
	}

	if (!persisted && !notified) return integrationUnavailable();
	return NextResponse.json({ ok: true, reference });
}
