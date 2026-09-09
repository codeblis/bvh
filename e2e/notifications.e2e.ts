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

test("aviso rechazado conserva la solicitud y el reintento administrativo la marca enviada", async ({
	page,
	request,
}) => {
	const run = randomUUID();
	const email = `notify-${run}@example.test`;
	const admin = await createTestUser(`notify-admin-${run}@example.test`, true);
	try {
		await setEmailStub("reject", true);
		const submitted = await request.post("/api/contacto", {
			data: {
				nombre: "Persona E2E",
				email,
				asunto: "Otro",
				mensaje:
					"Mensaje sintético para verificar el fallo y reintento del aviso.",
			},
		});
		expect(submitted.status()).toBe(200);
		const payload = await submitted.json();
		expect(payload).toMatchObject({ ok: true, notification: "pending" });
		const reference: string = payload.reference;
		expect(reference).toMatch(/^BVH-CON-/);

		const failed = await service
			.from("contact_messages")
			.select(
				"id, notification_status, notification_attempts, notification_last_error, notification_provider_id, notified_at, notification_token",
			)
			.eq("email", email)
			.single();
		expect(failed.error).toBeNull();
		expect(failed.data?.notification_status).toBe("failed");
		expect(failed.data?.notification_attempts).toBe(1);
		expect(failed.data?.notification_last_error).toContain("Rechazo sintético");
		expect(failed.data?.notification_provider_id).toBeNull();
		expect(failed.data?.notified_at).toBeNull();

		const firstAttempts = await emailStubAttempts();
		expect(firstAttempts).toHaveLength(1);
		expect(firstAttempts[0].idempotencyKey).toBe(reference);
		expect(firstAttempts[0].subject).toContain(reference);

		await setEmailStub("accept");
		await signInPage(page, admin.email ?? "", "/admin");
		await page.goto("/admin/mensajes");
		const row = page.getByRole("row").filter({ hasText: email });
		await expect(row).toContainText("Falló");
		await expect(row).toContainText("1 intento");
		await row.getByRole("button", { name: "Reintentar aviso" }).click();
		await expect(page.getByRole("status")).toHaveText(
			"Aviso enviado correctamente.",
		);
		const sentRow = page.getByRole("row").filter({ hasText: email });
		await expect(sentRow).toContainText("Enviado");
		await expect(sentRow).toContainText("2 intentos");
		await expect(
			sentRow.getByRole("button", { name: "Reintentar aviso" }),
		).toHaveCount(0);

		const sent = await service
			.from("contact_messages")
			.select(
				"notification_status, notification_attempts, notification_last_error, notification_provider_id, notified_at",
			)
			.eq("email", email)
			.single();
		expect(sent.data?.notification_status).toBe("sent");
		expect(sent.data?.notification_attempts).toBe(2);
		expect(sent.data?.notification_last_error).toBeNull();
		expect(sent.data?.notification_provider_id).toBeTruthy();
		expect(sent.data?.notified_at).toBeTruthy();

		const retried = await emailStubAttempts();
		expect(retried).toHaveLength(2);
		expect(retried[1].idempotencyKey).toBe(`${reference}-2`);
		expect(retried[1].to).toEqual("operaciones@example.test");

		// Un registro ya enviado no abre intentos nuevos aunque se repita la acción.
		await page.goto("/admin/mensajes");
		await expect(
			page
				.getByRole("row")
				.filter({ hasText: email })
				.getByRole("button", { name: "Reintentar aviso" }),
		).toHaveCount(0);
		expect(await emailStubAttempts()).toHaveLength(2);
	} finally {
		const removed = await service
			.from("contact_messages")
			.delete()
			.eq("email", email);
		expect.soft(removed.error).toBeNull();
		await deleteTestUser(admin.id);
	}
});

test("resultado incierto del proveedor reutiliza la clave idempotente en el reintento", async ({
	page,
	request,
}) => {
	const run = randomUUID();
	const email = `uncertain-${run}@example.test`;
	const admin = await createTestUser(
		`uncertain-admin-${run}@example.test`,
		true,
	);
	try {
		// El proveedor recibe el correo y corta la conexión: la aplicación no
		// puede saber si fue aceptado.
		await setEmailStub("drop", true);
		const submitted = await request.post("/api/newsletter", {
			data: { email, nombre: "Persona E2E", source: "e2e-uncertain" },
		});
		expect(submitted.status()).toBe(200);
		expect(await submitted.json()).toMatchObject({ ok: true });

		const accepted = await emailStubAttempts();
		expect(accepted).toHaveLength(1);
		const originalKey = accepted[0].idempotencyKey;
		expect(originalKey).toMatch(/^BVH-NEWS-/);

		const created = await service
			.from("newsletter_subscriptions")
			.select("id, reference, notification_status, notification_attempts")
			.eq("email", email)
			.single();
		expect(created.error).toBeNull();
		expect(created.data?.reference).toBe(originalKey);
		expect(created.data?.notification_status).toBe("failed");

		// Simula que la confirmación del proveedor no llegó a guardarse: el
		// registro se queda como al salir del formulario, sin resultado.
		const reset = await service
			.from("newsletter_subscriptions")
			.update({
				notification_status: "pending",
				notification_attempts: 0,
				notification_last_error: null,
			})
			.eq("id", created.data?.id ?? "");
		expect(reset.error).toBeNull();

		await setEmailStub("accept");
		await signInPage(page, admin.email ?? "", "/admin");
		await page.goto("/admin/newsletter");
		const row = page.getByRole("row").filter({ hasText: email });
		await expect(row).toContainText("Pendiente");
		await expect(row).toContainText("sin intentos");
		await row.getByRole("button", { name: "Reintentar aviso" }).click();
		await expect(page.getByRole("status")).toHaveText(
			"Aviso enviado correctamente.",
		);

		const attempts = await emailStubAttempts();
		expect(attempts).toHaveLength(2);
		expect(attempts[1].idempotencyKey).toBe(originalKey);

		const stored = await service
			.from("newsletter_subscriptions")
			.select("notification_status, notification_attempts, is_active")
			.eq("email", email)
			.single();
		expect(stored.data?.notification_status).toBe("sent");
		expect(stored.data?.notification_attempts).toBe(1);
		expect(stored.data?.is_active).toBe(true);
	} finally {
		const removed = await service
			.from("newsletter_subscriptions")
			.delete()
			.eq("email", email);
		expect.soft(removed.error).toBeNull();
		await deleteTestUser(admin.id);
	}
});

test("el estado de entrega del newsletter solo es visible para administradores", async ({
	page,
	browser,
	request,
}) => {
	const run = randomUUID();
	const email = `guard-${run}@example.test`;
	const admin = await createTestUser(`guard-admin-${run}@example.test`, true);
	const visitor = await browser.newPage({ baseURL: "http://127.0.0.1:3100" });
	try {
		await setEmailStub("reject", true);
		const submitted = await request.post("/api/newsletter", {
			data: { email, source: "e2e-guard" },
		});
		expect(submitted.status()).toBe(200);

		await visitor.goto("/admin/newsletter");
		await expect(visitor).toHaveURL((url) => url.pathname === "/login");

		await signInPage(page, admin.email ?? "", "/admin");
		await page.goto("/admin/newsletter");
		await expect(
			page.getByRole("row").filter({ hasText: email }),
		).toContainText("Falló");
		// El fallo del proveedor no oculta la suscripción ni la marca inactiva.
		const stored = await service
			.from("newsletter_subscriptions")
			.select("is_active, notification_status")
			.eq("email", email)
			.single();
		expect(stored.data?.is_active).toBe(true);
		expect(stored.data?.notification_status).toBe("failed");
	} finally {
		await visitor.close();
		const removed = await service
			.from("newsletter_subscriptions")
			.delete()
			.eq("email", email);
		expect.soft(removed.error).toBeNull();
		await deleteTestUser(admin.id);
	}
});
