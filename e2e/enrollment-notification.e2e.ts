import { randomUUID } from "node:crypto";
import { expect, test } from "@playwright/test";
import {
	createTestUser,
	deleteTestUser,
	emailStubAttempts,
	service,
	setEmailStub,
	signInPage,
} from "./local";

test.afterEach(async () => {
	await setEmailStub("reject", true);
});

test("la plaza sobrevive al fallo del correo y el reintento administrativo cierra el aviso", async ({
	page,
	browser,
}) => {
	test.setTimeout(120_000);
	const run = randomUUID();
	const slug = `e2e-enroll-${run}`;
	const title = `Curso con aviso ${run}`;
	const users: string[] = [];
	let courseId: string | undefined;
	const student = await browser.newPage({ baseURL: "http://127.0.0.1:3100" });

	try {
		await setEmailStub("reject", true);

		const course = await service
			.from("courses")
			.insert({
				title,
				slug,
				description: "Curso sintético para verificar el aviso de inscripción.",
				status: "activo",
			})
			.select("id")
			.single();
		expect(course.error).toBeNull();
		courseId = course.data?.id;
		if (!courseId) throw new Error("Course was not created");

		const offering = await service
			.from("course_offerings")
			.insert({
				course_id: courseId,
				starts_at: "2027-10-10T13:00:00Z",
				modality: "online",
				capacity: 5,
				status: "abierta",
			})
			.select("id")
			.single();
		expect(offering.error).toBeNull();

		const admin = await createTestUser(
			`enroll-admin-${run}@example.test`,
			true,
		);
		users.push(admin.id);
		const learnerEmail = `enroll-learner-${run}@example.test`;
		const learner = await createTestUser(learnerEmail);
		users.push(learner.id);

		// El alumno se inscribe mientras el proveedor de correo rechaza todo.
		const coursePath = `/instituto/cursos/${slug}`;
		await signInPage(student, learnerEmail, "/cuenta");
		await student.goto(coursePath);
		await student.getByRole("button", { name: "Inscribirme" }).click();
		await expect(student).toHaveURL(new RegExp(`${slug}\\?enrolled=true$`));

		const failed = await service
			.from("course_enrollments")
			.select(
				"id, status, reference, notification_status, notification_attempts, notification_last_error, notification_provider_id, notified_at, notification_token",
			)
			.eq("user_id", learner.id)
			.single();
		expect(failed.error).toBeNull();
		// Lo que importa: la plaza quedó confirmada aunque el correo fallara.
		expect(failed.data?.status).toBe("confirmada");
		expect(failed.data?.notification_status).toBe("failed");
		expect(failed.data?.notification_attempts).toBe(1);
		expect(failed.data?.notification_last_error).toContain("Rechazo sintético");
		expect(failed.data?.notification_provider_id).toBeNull();
		expect(failed.data?.notified_at).toBeNull();
		expect(failed.data?.notification_token).toBeNull();
		const reference = failed.data?.reference ?? "";
		expect(reference).toMatch(/^BVH-INS-/);

		const firstAttempts = await emailStubAttempts();
		expect(firstAttempts).toHaveLength(1);
		expect(firstAttempts[0].idempotencyKey).toBe(reference);
		expect(firstAttempts[0].subject).toContain(reference);
		// La confirmación va al alumno, no al buzón de operaciones.
		expect(firstAttempts[0].to).toEqual(learnerEmail);

		await setEmailStub("accept");
		await signInPage(page, admin.email ?? "", "/admin");
		await page.goto("/admin/cursos/inscripciones");
		const row = page.getByRole("row").filter({ hasText: learnerEmail });
		await expect(row).toContainText("Falló");
		await expect(row).toContainText("1 intento");
		await row.getByRole("button", { name: "Reintentar aviso" }).click();
		await expect(page.getByRole("status")).toHaveText(
			"Aviso enviado correctamente.",
		);
		const sentRow = page.getByRole("row").filter({ hasText: learnerEmail });
		await expect(sentRow).toContainText("Enviado");
		await expect(sentRow).toContainText("2 intentos");
		await expect(
			sentRow.getByRole("button", { name: "Reintentar aviso" }),
		).toHaveCount(0);

		const sent = await service
			.from("course_enrollments")
			.select(
				"notification_status, notification_attempts, notification_last_error, notification_provider_id, notified_at",
			)
			.eq("user_id", learner.id)
			.single();
		expect(sent.data?.notification_status).toBe("sent");
		expect(sent.data?.notification_attempts).toBe(2);
		expect(sent.data?.notification_last_error).toBeNull();
		expect(sent.data?.notification_provider_id).toBeTruthy();
		expect(sent.data?.notified_at).toBeTruthy();

		const retried = await emailStubAttempts();
		expect(retried).toHaveLength(2);
		expect(retried[1].idempotencyKey).toBe(`${reference}-2`);
		expect(retried[1].to).toEqual(learnerEmail);

		// Inscribirse otra vez es idempotente: ni segunda plaza ni tercer correo.
		await student.goto(coursePath);
		await student.getByRole("button", { name: "Inscribirme" }).click();
		await expect(student).toHaveURL(new RegExp(`${slug}\\?enrolled=true$`));
		expect(await emailStubAttempts()).toHaveLength(2);
		const stillOne = await service
			.from("course_enrollments")
			.select("id, notification_attempts", { count: "exact" })
			.eq("user_id", learner.id);
		expect(stillOne.count).toBe(1);
		expect(stillOne.data?.[0]?.notification_attempts).toBe(2);
	} finally {
		if (courseId) {
			await service
				.from("course_enrollments")
				.delete()
				.eq("course_id", courseId);
			await service.from("course_offerings").delete().eq("course_id", courseId);
			await service.from("courses").delete().eq("id", courseId);
		}
		for (const id of users) await deleteTestUser(id);
		await student.close();
	}
});
