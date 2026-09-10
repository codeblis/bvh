import { NextResponse } from "next/server";
import {
	invalidRequest,
	persistenceUnavailable,
	tooManyRequests,
	verificationRequired,
} from "@/lib/api-response";
import type { EmployeeRange } from "@/lib/forms";
import { createReference, escapeHtml, quoteSchema } from "@/lib/forms";
import { clientFingerprint, readBoundedJson } from "@/lib/request";
import { emailConfig } from "@/lib/resend";
import { createServiceClient } from "@/lib/supabase/service";
import { deliverEmail } from "@/modules/forms/email.server";
import { withinRateLimit } from "@/modules/forms/rate-limit.server";
import { verifyTurnstile } from "@/modules/forms/turnstile.server";

const EMPLOYEE_RANGE_FLOORS = {
	"1–10": 1,
	"11–50": 11,
	"51–100": 51,
	"101–250": 101,
	"251–500": 251,
	">500": 501,
} satisfies Record<EmployeeRange, number>;

export async function POST(request: Request) {
	const body = await readBoundedJson(request);
	const parsed = quoteSchema.safeParse(body);
	if (!parsed.success) return invalidRequest();

	// Primero el coste barato: quien excede el límite no llega a la base.
	const fingerprint = await clientFingerprint(request);
	let supabase: ReturnType<typeof createServiceClient>;
	try {
		supabase = createServiceClient();
	} catch {
		return persistenceUnavailable();
	}
	if (!(await withinRateLimit(supabase, fingerprint, "cotizaciones"))) {
		return tooManyRequests();
	}

	const verified = await verifyTurnstile(
		(body as { turnstileToken?: string })?.turnstileToken,
		fingerprint,
	);
	if (!verified.ok) return verificationRequired();

	const data = parsed.data;
	const reference = createReference("BVH-RIE");
	const employeeCount = EMPLOYEE_RANGE_FLOORS[data.employees];
	const persisted = await supabase
		.rpc("submit_company_application", {
			p_company_name: data.companyName,
			p_tax_id: data.taxId,
			p_legal_representative: data.legalRep,
			p_email: data.email,
			p_phone: data.phone,
			p_sector: data.sector,
			p_founding_year: Number.parseInt(data.founded, 10),
			p_annual_revenue: data.revenue,
			p_employee_count: employeeCount,
			p_description: data.description,
			p_wants_advisor: data.wantsAdvisor,
			p_accepted_terms: data.acceptedTerms,
			p_reference: reference,
		})
		.single();
	if (persisted.error || !persisted.data) return persistenceUnavailable();

	const fields = Object.entries(data)
		.map(
			([key, value]) =>
				`<p><strong>${escapeHtml(key)}:</strong> ${escapeHtml(String(value))}</p>`,
		)
		.join("");
	const delivery = await deliverEmail(
		{
			from: emailConfig.from,
			to: emailConfig.to,
			replyTo: data.email,
			subject: `[${reference}] Solicitud RIE-BVH · ${data.companyName}`,
			html: `<h1>Nueva solicitud RIE-BVH</h1>${fields}`,
		},
		reference,
	);
	await supabase.rpc("record_form_notification", {
		p_resource_type: "company_application",
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
