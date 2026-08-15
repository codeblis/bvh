import { NextResponse } from "next/server";
import { invalidRequest, integrationUnavailable } from "@/lib/api-response";
import { createReference, escapeHtml, newsletterSchema } from "@/lib/forms";
import { emailConfig, getResendClient } from "@/lib/resend";

export async function POST(request: Request) {
	const parsed = newsletterSchema.safeParse(await request.json().catch(() => null));
	if (!parsed.success) return invalidRequest();

	const resend = getResendClient();
	if (!resend) return integrationUnavailable();

	const reference = createReference("BVH-NEWS");
	const { email, nombre, perfil, source } = parsed.data;
	const { error } = await resend.emails.send({
		from: emailConfig.from,
		to: emailConfig.to,
		replyTo: email,
		subject: `[${reference}] Nueva suscripción BVH`,
		html: `<h1>Nueva suscripción</h1><p><strong>Email:</strong> ${escapeHtml(email)}</p><p><strong>Nombre:</strong> ${escapeHtml(nombre ?? "—")}</p><p><strong>Perfil:</strong> ${escapeHtml(perfil ?? "—")}</p><p><strong>Origen:</strong> ${escapeHtml(source ?? "sitio")}</p>`,
	});

	if (error) return integrationUnavailable();
	return NextResponse.json({ ok: true, reference });
}
