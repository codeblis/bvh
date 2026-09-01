import { NextResponse } from "next/server";
import { invalidRequest, integrationUnavailable } from "@/lib/api-response";
import { createReference, escapeHtml, quoteSchema } from "@/lib/forms";
import { emailConfig, getResendClient } from "@/lib/resend";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
	const parsed = quoteSchema.safeParse(await request.json().catch(() => null));
	if (!parsed.success) return invalidRequest();

	const data = parsed.data;
	const reference = createReference("BVH-RIE");

	let persisted = false;
	try {
		const supabase = await createClient();
		const employeeCount = Number.parseInt(data.employees, 10);
		const { error } = await supabase.from("company_applications").insert({
			company_name: data.companyName,
			tax_id: data.taxId,
			legal_representative: data.legalRep,
			corporate_email: data.email,
			phone: data.phone,
			sector: data.sector,
			founding_year: Number.parseInt(data.founded, 10),
			annual_revenue: data.revenue,
			employee_count: Number.isNaN(employeeCount) ? null : employeeCount,
			description: data.description,
			wants_advisor_contact: data.wantsAdvisor,
		});
		persisted = !error;
	} catch {
		persisted = false;
	}

	let notified = false;
	const resend = getResendClient();
	if (resend) {
		const fields = Object.entries(data)
			.map(([key, value]) => `<p><strong>${escapeHtml(key)}:</strong> ${escapeHtml(String(value))}</p>`)
			.join("");
		const { error } = await resend.emails.send({
			from: emailConfig.from,
			to: emailConfig.to,
			replyTo: data.email,
			subject: `[${reference}] Solicitud RIE-BVH · ${data.companyName}`,
			html: `<h1>Nueva solicitud RIE-BVH</h1>${fields}`,
		});
		notified = !error;
	}

	if (!persisted && !notified) return integrationUnavailable();
	return NextResponse.json({ ok: true, reference });
}
