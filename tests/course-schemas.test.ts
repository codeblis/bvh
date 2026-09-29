import { expect, test } from "vitest";
import {
	courseOfferingAdminFormSchema,
	enrollmentStatusFormSchema,
	parseCourseCatalogForm,
} from "../src/modules/courses/schemas.ts";

test("normaliza el catálogo y genera slug", () => {
	const form = new FormData();
	form.set("title", "Introducción al Mercado de Valores");
	form.set("description", "Curso inicial");
	form.set("content", "Temario");
	form.set("image", "");
	form.set("instructor", "Equipo BVH");
	form.set("status", "activo");

	const result = parseCourseCatalogForm(form);
	expect(result.success).toBe(true);
	if (result.success) {
		expect(result.data.slug).toBe("introduccion-al-mercado-de-valores");
	}
});

test("una edición abierta exige fecha de inicio", () => {
	const result = courseOfferingAdminFormSchema.safeParse({
		courseId: "ad438e57-d60c-4cb7-9a50-99120f6c6013",
		startsAt: "",
		endsAt: "",
		timezone: "America/Havana",
		modality: "online",
		location: null,
		price: 0,
		currency: "USD",
		capacity: 20,
		offeringStatus: "abierta",
	});
	expect(result.success).toBe(false);
});

test("una edición presencial exige ubicación pública", () => {
	const result = courseOfferingAdminFormSchema.safeParse({
		courseId: "ad438e57-d60c-4cb7-9a50-99120f6c6013",
		startsAt: "2026-10-01T09:00",
		endsAt: "2026-10-01T17:00",
		timezone: "America/Havana",
		modality: "presencial",
		location: null,
		price: 10,
		currency: "USD",
		capacity: 20,
		offeringStatus: "abierta",
	});
	expect(result.success).toBe(false);
});

test("restringe estados administrativos de inscripción", () => {
	expect(
		enrollmentStatusFormSchema.safeParse({
			id: "ad438e57-d60c-4cb7-9a50-99120f6c6013",
			status: "confirmada",
		}).success,
	).toBe(true);
	expect(
		enrollmentStatusFormSchema.safeParse({
			id: "ad438e57-d60c-4cb7-9a50-99120f6c6013",
			status: "admin",
		}).success,
	).toBe(false);
});
