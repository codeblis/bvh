import { NextResponse } from "next/server";
import { invalidRequest, integrationUnavailable } from "@/lib/api-response";
import { createReference, escapeHtml, quoteSchema } from "@/lib/forms";
import { emailConfig, getResendClient } from "@/lib/resend";

export async function POST(request: Request) {
	const parsed = quoteSchema.safeParse(await request.json().catch(() => null));
	if (!parsed.success) return invalidRequest();

	const resend = getResendClient();
	if (!resend) return integrationUnavailable();

	const reference = createReference("BVH-RIE");
	const fields = Object.entries(parsed.data)
		.map(([key, value]) => `<p><strong>${escapeHtml(key)}:</strong> ${escapeHtml(String(value))}</p>`)
		.join("");
	const { error } = await resend.emails.send({
		from: emailConfig.from,
		to: emailConfig.to,
		replyTo: parsed.data.email,
		subject: `[${reference}] Solicitud RIE-BVH · ${parsed.data.companyName}`,
		html: `<h1>Nueva solicitud RIE-BVH</h1>${fields}`,
	});

	if (error) return integrationUnavailable();
	return NextResponse.json({ ok: true, reference });
}
