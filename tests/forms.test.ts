import { expect, test } from "vitest";
import {
	contactSchema,
	createReference,
	escapeHtml,
	newsletterSchema,
	quoteSchema,
	unsubscribeSchema,
} from "../src/lib/forms.ts";

test("contactSchema accepts a complete contact and rejects malformed email", () => {
	expect(
		contactSchema.safeParse({
			nombre: "Eblis Caro",
			email: "eblis@example.com",
			asunto: "Prensa",
			mensaje: "Quiero conocer más sobre el proyecto.",
		}).success,
	).toBe(true);
	expect(
		contactSchema.safeParse({
			nombre: "Eblis Caro",
			email: "no-es-email",
			asunto: "Prensa",
			mensaje: "Quiero conocer más sobre el proyecto.",
		}).success,
	).toBe(false);
});

test("newsletterSchema normalizes optional fields and demands a list", () => {
	const parsed = newsletterSchema.parse({
		email: " Lector@Example.com ",
		source: "portada",
		lista: "institucional",
	});
	expect(parsed.email).toBe("lector@example.com");
	expect(parsed.source).toBe("portada");
	expect(parsed.lista).toBe("institucional");
	// Sin lista no se sabe a qué consintió quien se suscribe: no se acepta.
	expect(
		newsletterSchema.safeParse({ email: "lector@example.com" }).success,
	).toBe(false);
	expect(
		newsletterSchema.safeParse({
			email: "lector@example.com",
			lista: "inventada",
		}).success,
	).toBe(false);
});

test("quoteSchema requires consent and a complete business description", () => {
	const base = {
		companyName: "Empresa Demo",
		taxId: "123456",
		legalRep: "Ana Pérez",
		email: "ana@example.com",
		phone: "+53 55555555",
		sector: "Tecnología",
		founded: "2020",
		revenue: "50k-100k",
		employees: "11–50",
		description: "Descripción suficientemente detallada del negocio.",
		acceptedTerms: true,
		wantsAdvisor: false,
	};
	expect(quoteSchema.safeParse(base).success).toBe(true);
	expect(quoteSchema.safeParse({ ...base, acceptedTerms: false }).success).toBe(
		false,
	);
	expect(
		quoteSchema.safeParse({
			...base,
			founded: String(new Date().getFullYear() + 1),
		}).success,
	).toBe(false);
});

test("email helpers escape markup and create non-sequential references", () => {
	expect(escapeHtml('<script>"x"</script>')).toBe(
		"&lt;script&gt;&quot;x&quot;&lt;/script&gt;",
	);
	const first = createReference("BVH");
	const second = createReference("BVH");
	expect(first).toMatch(/^BVH-[A-F0-9]{8}$/);
	expect(first).not.toBe(second);
});

test("la baja exige un token UUID", () => {
	expect(
		unsubscribeSchema.safeParse({
			token: "ad438e57-d60c-4cb7-9a50-99120f6c6013",
		}).success,
	).toBe(true);
	expect(unsubscribeSchema.safeParse({ token: "no-valido" }).success).toBe(
		false,
	);
});
