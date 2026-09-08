import { z } from "zod";

const email = z
	.string()
	.trim()
	.email()
	.max(254)
	.transform((value) => value.toLowerCase());
const shortText = z.string().trim().min(2).max(160);

export const EMPLOYEE_RANGES = [
	"1–10",
	"11–50",
	"51–100",
	"101–250",
	"251–500",
	">500",
] as const;
export type EmployeeRange = (typeof EMPLOYEE_RANGES)[number];

export const contactSchema = z.object({
	nombre: shortText,
	email,
	asunto: shortText,
	mensaje: z.string().trim().min(10).max(5000),
});

export const newsletterSchema = z.object({
	email,
	nombre: z.string().trim().max(160).optional(),
	perfil: z.string().trim().max(100).optional(),
	source: z.string().trim().max(80).optional(),
});

export const unsubscribeSchema = z.object({ token: z.string().uuid() });

export const quoteSchema = z.object({
	companyName: shortText,
	taxId: z.string().trim().min(5).max(50),
	legalRep: shortText,
	email,
	phone: z.string().trim().min(6).max(40),
	sector: shortText,
	founded: z
		.string()
		.regex(/^\d{4}$/)
		.refine((value) => {
			const year = Number(value);
			return year >= 1800 && year <= new Date().getFullYear();
		}),
	revenue: shortText,
	employees: z.enum(EMPLOYEE_RANGES),
	description: z.string().trim().min(20).max(5000),
	acceptedTerms: z.literal(true),
	wantsAdvisor: z.boolean(),
});

export function escapeHtml(value: string) {
	return value.replace(/[&<>'"]/g, (character) => {
		const entities: Record<string, string> = {
			"&": "&amp;",
			"<": "&lt;",
			">": "&gt;",
			"'": "&#39;",
			'"': "&quot;",
		};
		return entities[character];
	});
}

export function createReference(prefix: string) {
	return `${prefix}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}
