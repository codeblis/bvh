import { NextResponse } from "next/server";
import { invalidRequest, integrationUnavailable } from "@/lib/api-response";
import { contactSchema, createReference, escapeHtml } from "@/lib/forms";
import { emailConfig, getResendClient } from "@/lib/resend";

export async function POST(request: Request) {
	const parsed = contactSchema.safeParse(await request.json().catch(() => null));
	if (!parsed.success) return invalidRequest();

	const resend = getResendClient();
	if (!resend) return integrationUnavailable();

	const reference = createReference("BVH-CON");
	const { nombre, email, asunto, mensaje } = parsed.data;
	const { error } = await resend.emails.send({
		from: emailConfig.from,
		to: emailConfig.to,
		replyTo: email,
		subject: `[${reference}] ${asunto}`,
		html: `<h1>Nuevo contacto BVH</h1><p><strong>Nombre:</strong> ${escapeHtml(nombre)}</p><p><strong>Email:</strong> ${escapeHtml(email)}</p><p><strong>Asunto:</strong> ${escapeHtml(asunto)}</p><p>${escapeHtml(mensaje).replaceAll("\n", "<br>")}</p>`,
	});

	if (error) return integrationUnavailable();
	return NextResponse.json({ ok: true, reference });
}
