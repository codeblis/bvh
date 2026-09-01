import { NextResponse } from "next/server";
import { invalidRequest, integrationUnavailable } from "@/lib/api-response";
import { contactSchema, createReference, escapeHtml } from "@/lib/forms";
import { emailConfig, getResendClient } from "@/lib/resend";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
	const parsed = contactSchema.safeParse(await request.json().catch(() => null));
	if (!parsed.success) return invalidRequest();

	const { nombre, email, asunto, mensaje } = parsed.data;
	const reference = createReference("BVH-CON");

	let persisted = false;
	try {
		const supabase = await createClient();
		const { error } = await supabase
			.from("contact_messages")
			.insert({ name: nombre, email, subject: asunto, message: mensaje });
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
			subject: `[${reference}] ${asunto}`,
			html: `<h1>Nuevo contacto BVH</h1><p><strong>Nombre:</strong> ${escapeHtml(nombre)}</p><p><strong>Email:</strong> ${escapeHtml(email)}</p><p><strong>Asunto:</strong> ${escapeHtml(asunto)}</p><p>${escapeHtml(mensaje).replaceAll("\n", "<br>")}</p>`,
		});
		notified = !error;
	}

	if (!persisted && !notified) return integrationUnavailable();
	return NextResponse.json({ ok: true, reference });
}
