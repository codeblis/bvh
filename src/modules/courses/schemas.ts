import { z } from "zod";
import { slugify } from "@/lib/utils";

export const enrollmentFormSchema = z.object({
	offeringId: z.string().uuid(),
	courseSlug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
});

const optionalText = (max: number) =>
	z
		.string()
		.trim()
		.max(max)
		.transform((value) => value || null);

const optionalNumber = z
	.union([z.literal(""), z.coerce.number().nonnegative()])
	.transform((value) => value === "" ? null : value);

export const courseCatalogFormSchema = z.object({
	id: z.string().uuid().optional(),
	title: z.string().trim().min(5).max(160),
	slug: z.string().trim().min(1).max(180),
	description: optionalText(1_000),
	content: optionalText(100_000),
	image: z
		.union([z.literal(""), z.string().trim().url().max(2_000)])
		.transform((value) => value || null),
	instructor: optionalText(160),
	status: z.enum(["borrador", "activo", "archivado"]),
});

export const courseOfferingAdminFormSchema = z
	.object({
		courseId: z.string().uuid(),
		offeringId: z.string().uuid().optional(),
		startsAt: z.string().trim(),
		endsAt: z.string().trim(),
		timezone: z.string().trim().min(1).max(80),
		modality: z.enum(["online", "presencial", "hibrido", "por_confirmar"]),
		location: optionalText(500),
		price: optionalNumber,
		currency: z.string().trim().regex(/^[A-Z]{3}$/),
		capacity: z
			.union([z.literal(""), z.coerce.number().int().positive()])
			.transform((value) => value === "" ? null : value),
		offeringStatus: z.enum([
			"borrador",
			"abierta",
			"cerrada",
			"cancelada",
			"finalizada",
		]),
	})
	.superRefine((data, context) => {
		if (data.startsAt && Number.isNaN(Date.parse(data.startsAt))) {
			context.addIssue({ code: "custom", path: ["startsAt"], message: "Fecha inválida" });
		}
		if (data.endsAt && Number.isNaN(Date.parse(data.endsAt))) {
			context.addIssue({ code: "custom", path: ["endsAt"], message: "Fecha inválida" });
		}
		if (data.offeringStatus === "abierta" && !data.startsAt) {
			context.addIssue({ code: "custom", path: ["startsAt"], message: "La fecha es obligatoria" });
		}
		if (
			(data.modality === "presencial" || data.modality === "hibrido") &&
			!data.location
		) {
			context.addIssue({ code: "custom", path: ["location"], message: "La ubicación es obligatoria" });
		}
		if (data.startsAt && data.endsAt && Date.parse(data.endsAt) <= Date.parse(data.startsAt)) {
			context.addIssue({ code: "custom", path: ["endsAt"], message: "Debe terminar después del inicio" });
		}
	});

export const enrollmentStatusFormSchema = z.object({
	id: z.string().uuid(),
	status: z.enum([
		"pendiente",
		"confirmada",
		"lista_espera",
		"cancelada",
		"completada",
	]),
});

export function parseCourseCatalogForm(formData: FormData) {
	const title = String(formData.get("title") ?? "");
	return courseCatalogFormSchema.safeParse({
		id: String(formData.get("id") ?? "") || undefined,
		title,
		slug: slugify(String(formData.get("slug") ?? "") || title),
		description: String(formData.get("description") ?? ""),
		content: String(formData.get("content") ?? ""),
		image: String(formData.get("image") ?? ""),
		instructor: String(formData.get("instructor") ?? ""),
		status: String(formData.get("status") ?? ""),
	});
}

export function parseCourseOfferingForm(formData: FormData) {
	return courseOfferingAdminFormSchema.safeParse({
		courseId: String(formData.get("course_id") ?? ""),
		offeringId: String(formData.get("offering_id") ?? "") || undefined,
		startsAt: String(formData.get("starts_at") ?? ""),
		endsAt: String(formData.get("ends_at") ?? ""),
		timezone: String(formData.get("timezone") ?? "America/Havana"),
		modality: String(formData.get("modality") ?? ""),
		location: String(formData.get("location") ?? ""),
		price: String(formData.get("price") ?? ""),
		currency: String(formData.get("currency") ?? "USD").toUpperCase(),
		capacity: String(formData.get("capacity") ?? ""),
		offeringStatus: String(formData.get("offering_status") ?? ""),
	});
}
