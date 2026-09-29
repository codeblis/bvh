import { randomUUID } from "node:crypto";
import { expect, test } from "@playwright/test";
import {
	createTestUser,
	deleteTestUser,
	service,
	signInApi,
	signInPage,
	testPassword,
} from "./local";

test("curso y dos ediciones: inscripción, cupo, cierre, cancelación e historial", async ({
	page,
	browser,
}) => {
	test.setTimeout(120_000);
	const run = randomUUID();
	const slug = `e2e-course-${run}`;
	const title = `Curso E2E ${run}`;
	const users: string[] = [];
	let courseId: string | undefined;
	const student = await browser.newPage({ baseURL: "http://127.0.0.1:3100" });
	try {
		const admin = await createTestUser(`admin-${run}@example.test`, true);
		users.push(admin.id);
		const learner = await createTestUser(`learner-${run}@example.test`);
		users.push(learner.id);
		const second = await createTestUser(`second-${run}@example.test`);
		users.push(second.id);
		await signInPage(page, admin.email ?? "", "/admin");
		await expect(page.getByRole("heading", { name: "Resumen" })).toBeVisible();
		await page.goto("/admin/cursos/nuevo");
		await page.getByLabel("Título", { exact: true }).fill(title);
		await page.getByLabel("Slug").fill(slug);
		await page
			.getByLabel("Descripción")
			.fill(
				"Curso sintético para verificar el ciclo de inscripción y su historial.",
			);
		await page
			.getByLabel("Contenido / temario")
			.fill(
				"Temario verificable de un curso con varias ediciones independientes.",
			);
		await page.getByLabel("Instructor").fill("Docente E2E");
		await page
			.getByRole("combobox", { name: /^Estado/ })
			.selectOption("activo");
		await page.getByRole("button", { name: "Guardar", exact: true }).click();
		await expect(page).toHaveURL(/\/admin\/cursos\/[a-f0-9-]+\?saved=true$/);
		courseId = new URL(page.url()).pathname.split("/").at(-1);
		if (!courseId) throw new Error("Course was not created");
		const coursePath = `/instituto/cursos/${slug}`;
		await student.goto(coursePath);
		await expect(
			student.getByText("No hay ediciones abiertas en este momento."),
		).toBeVisible();
		await expect(
			student.getByRole("button", { name: "Inscribirme" }),
		).toHaveCount(0);
		await student.goto("/instituto");
		await expect(student.getByRole("heading", { name: title })).toHaveCount(0);

		const offeringIds: string[] = [];
		for (const month of ["10", "11"]) {
			await page.goto(`/admin/cursos/${courseId}/ofertas/nueva`);
			await page
				.getByLabel("Inicio", { exact: true })
				.fill(`2027-${month}-10T09:00`);
			await page
				.getByLabel("Fin", { exact: true })
				.fill(`2027-${month}-10T12:00`);
			await page
				.getByRole("combobox", { name: /^Modalidad/ })
				.selectOption("online");
			await page.getByLabel("Plazas", { exact: true }).fill("2");
			await page.getByLabel("Precio", { exact: true }).fill("50");
			await page
				.getByRole("combobox", { name: /^Estado/ })
				.selectOption("abierta");
			await page.getByRole("button", { name: "Guardar", exact: true }).click();
			await expect(page).toHaveURL(/\/ofertas\/[a-f0-9-]+\?saved=true$/);
			const id = new URL(page.url()).pathname.split("/").at(-1);
			if (!id) throw new Error("Offering was not created");
			offeringIds.push(id);
		}
		const [offeringId] = offeringIds;
		const offeringPath = `/admin/cursos/${courseId}/ofertas/${offeringId}`;
		await student.goto("/instituto");
		await expect(student.getByRole("heading", { name: title })).toBeVisible();
		await student.goto(coursePath);
		await expect(student.getByText("Zona horaria: America/Havana")).toHaveCount(
			2,
		);
		await expect(
			student.getByRole("button", { name: "Inscribirme" }),
		).toHaveCount(2);
		await student.getByRole("button", { name: "Inscribirme" }).first().click();
		await expect(student).toHaveURL(
			(url) =>
				url.pathname === "/login" &&
				url.searchParams.get("callbackUrl") === coursePath,
		);
		await student.getByLabel("Email").fill(learner.email ?? "");
		await student.getByLabel("Contraseña").fill(testPassword);
		await student.getByRole("button", { name: "Iniciar sesión" }).click();
		await expect(student).toHaveURL((url) => url.pathname === coursePath);
		await student.getByRole("button", { name: "Inscribirme" }).first().click();
		await expect(student.getByRole("status")).toContainText(
			"Inscripción registrada",
		);
		await student.goto(coursePath);
		await student.getByRole("button", { name: "Inscribirme" }).first().click();
		await expect(student.getByRole("status")).toContainText(
			"Inscripción registrada",
		);
		const enrolled = await service
			.from("course_enrollments")
			.select("id")
			.eq("offering_id", offeringId)
			.eq("user_id", learner.id);
		expect(enrolled.error).toBeNull();
		expect(enrolled.data).toHaveLength(1);
		await student.goto("/cuenta");
		await expect(student.getByRole("heading", { name: title })).toBeVisible();
		const secondClient = await signInApi(second.email ?? "");
		expect(
			(
				await secondClient.rpc("enroll_in_course", {
					p_offering_id: offeringId,
				})
			).error,
		).toBeNull();
		await student.goto(coursePath);
		await expect(
			student.getByRole("button", { name: "Sin plazas" }),
		).toBeDisabled();
		await expect(
			student.getByRole("button", { name: "Inscribirme" }),
		).toHaveCount(1);
		await page.goto(offeringPath);
		await page.getByLabel("Plazas", { exact: true }).fill("1");
		await page.getByRole("button", { name: "Guardar", exact: true }).click();
		await expect(page.getByRole("main").getByRole("alert")).toContainText(
			"El cupo no puede quedar por debajo",
		);

		await page.goto(`/admin/cursos/inscripciones?offering=${offeringId}`);
		const row = page.getByRole("row").filter({ hasText: learner.email ?? "" });
		await row.getByRole("combobox").selectOption("cancelada");
		await expect
			.poll(
				async () =>
					(
						await service
							.from("course_enrollments")
							.select("status")
							.eq("offering_id", offeringId)
							.eq("user_id", learner.id)
							.single()
					).data?.status,
			)
			.toBe("cancelada");
		await student.goto("/cuenta");
		await expect(student.getByText("cancelada", { exact: true })).toBeVisible();
		await page.goto(offeringPath);
		page.once("dialog", (dialog) => dialog.accept());
		await page
			.getByRole("button", { name: "Cerrar inscripciones para esta edición" })
			.click();
		await expect(page).toHaveURL(
			(url) => url.pathname === `/admin/cursos/${courseId}`,
		);
		expect(
			(
				await secondClient.rpc("enroll_in_course", {
					p_offering_id: offeringId,
				})
			).error?.message,
		).toContain("offering_not_open");
		await student.goto(coursePath);
		await expect(
			student.getByRole("button", { name: "Inscribirme" }),
		).toHaveCount(1);
		await student.goto("/cuenta");
		await expect(student.getByRole("heading", { name: title })).toBeVisible();

		await page.goto(offeringPath);
		await page
			.getByRole("combobox", { name: /^Estado/ })
			.selectOption("cancelada");
		await page.getByRole("button", { name: "Guardar", exact: true }).click();
		await expect(page).toHaveURL(/saved=true/);
		await student.goto("/cuenta");
		await expect(
			student.getByText("Edición cancelada", { exact: true }),
		).toBeVisible();
		await page.goto("/admin/cursos");
		page.once("dialog", (dialog) => dialog.accept());
		await page
			.getByRole("row")
			.filter({ hasText: title })
			.getByRole("button", { name: "Archivar" })
			.click();
		await expect
			.poll(
				async () =>
					(
						await service
							.from("courses")
							.select("status")
							.eq("id", courseId ?? "")
							.single()
					).data?.status,
			)
			.toBe("archivado");
		expect((await student.request.get(coursePath)).status()).toBe(404);
		await student.goto("/cuenta");
		await expect(student.getByRole("heading", { name: title })).toBeVisible();
		await expect(student.getByRole("link", { name: "Ver curso" })).toHaveCount(
			0,
		);
	} finally {
		await student.close();
		if (courseId) {
			for (const table of ["course_enrollments", "course_offerings"] as const) {
				const removed = await service
					.from(table)
					.delete()
					.eq("course_id", courseId);
				expect.soft(removed.error, `Cleanup ${table}`).toBeNull();
			}
			const removed = await service.from("courses").delete().eq("id", courseId);
			expect.soft(removed.error, "Cleanup course").toBeNull();
		}
		for (const id of users) await deleteTestUser(id);
	}
});
