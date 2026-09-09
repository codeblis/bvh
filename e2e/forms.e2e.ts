import { randomUUID } from "node:crypto";
import { expect, test } from "@playwright/test";
import {
	createPublicClient,
	createTestUser,
	deleteTestUser,
	service,
	signInPage,
} from "./local";

test("formularios: tipos inválidos, JSON roto y 32 KiB no persisten; anon no escribe", async ({
	request,
}) => {
	const email = `invalid-${randomUUID()}@example.test`;
	const cases = [
		{
			path: "/api/contacto",
			table: "contact_messages",
			field: "email",
			data: {
				nombre: "Persona E2E",
				email,
				asunto: "Prueba E2E",
				mensaje: "Mensaje válido para prueba de rechazo.",
			},
		},
		{
			path: "/api/cotizaciones",
			table: "company_applications",
			field: "corporate_email",
			data: {
				companyName: "Empresa E2E",
				taxId: "E2E-12345",
				legalRep: "Persona E2E",
				email,
				phone: "+530000000",
				sector: "Tecnología",
				founded: "2020",
				revenue: "50k-100k",
				employees: "11–50",
				description:
					"Descripción sintética para probar el rechazo de entradas.",
				acceptedTerms: true,
				wantsAdvisor: false,
			},
		},
		{
			path: "/api/newsletter",
			table: "newsletter_subscriptions",
			field: "email",
			data: { email, source: "e2e" },
		},
	] as const;
	try {
		for (const entry of cases) {
			for (const input of [
				{ type: "text/plain", body: JSON.stringify(entry.data) },
				{ type: "application/json-extra", body: JSON.stringify(entry.data) },
				{ type: "application/json", body: "{" },
				{
					type: "application/json",
					body: JSON.stringify({ ...entry.data, padding: "á".repeat(17_000) }),
				},
				{
					type: "application/json",
					body: JSON.stringify({ ...entry.data, email: "invalid" }),
				},
			]) {
				const response = await request.post(entry.path, {
					headers: { "Content-Type": input.type },
					data: input.body,
				});
				expect(response.status()).toBe(400);
				expect(await response.json()).toEqual({
					ok: false,
					message: "Revisa los datos e inténtalo nuevamente.",
				});
			}
			const rows =
				entry.table === "company_applications"
					? await service
							.from(entry.table)
							.select("id")
							.eq("corporate_email", email)
					: await service.from(entry.table).select("id").eq("email", email);
			expect(rows.error).toBeNull();
			expect(rows.data).toHaveLength(0);
		}
		const anon = createPublicClient();
		const writes = [
			await anon
				.from("contact_messages")
				.insert({ name: "E2E", email, message: "Prueba directa rechazada" }),
			await anon.from("company_applications").insert({
				company_name: "E2E",
				corporate_email: email,
				legal_representative: "E2E",
				tax_id: "E2E-12345",
				phone: "+530000000",
				sector: "Tecnología",
			}),
			await anon.from("newsletter_subscriptions").insert({ email }),
			await anon.rpc("submit_newsletter_subscription", {
				p_email: email,
				p_full_name: "E2E",
				p_profile: "",
				p_source: "e2e",
				p_reference: "E2E-REJECT",
			}),
		];
		for (const result of writes) expect(result.error?.code).toBe("42501");
	} finally {
		for (const entry of cases) {
			const deleted =
				entry.table === "company_applications"
					? await service
							.from(entry.table)
							.delete()
							.eq("corporate_email", email)
					: await service.from(entry.table).delete().eq("email", email);
			expect.soft(deleted.error).toBeNull();
		}
	}
});

test("contacto y RIE-BVH: web registra, muestra aviso pendiente y CMS conserva solicitud", async ({
	page,
	browser,
}) => {
	const run = randomUUID();
	const email = `forms-${run}@example.test`;
	const admin = await createTestUser(`forms-admin-${run}@example.test`, true);
	const visitor = await browser.newPage({ baseURL: "http://127.0.0.1:3100" });
	try {
		await visitor.goto("/contacto");
		await visitor.getByLabel("Nombre *", { exact: true }).fill("Persona E2E");
		await visitor.getByLabel("Email *", { exact: true }).fill(email);
		await visitor.getByLabel("Asunto *", { exact: true }).selectOption("Otro");
		await visitor
			.getByLabel("Mensaje *", { exact: true })
			.fill(
				"Solicitud sintética que debe conservarse aunque no se envíe correo.",
			);
		await visitor.getByRole("button", { name: "Enviar mensaje" }).click();
		await expect(
			visitor.getByText(
				"El aviso por correo está pendiente; no necesitas reenviar el formulario.",
			),
		).toBeVisible();
		const contact = await service
			.from("contact_messages")
			.select("id, reference, notification_status, notification_attempts")
			.eq("email", email)
			.single();
		expect(contact.error).toBeNull();
		expect(contact.data?.notification_status).toBe("failed");
		expect(contact.data?.notification_attempts).toBe(1);
		await expect(
			visitor.getByText(`Referencia: ${contact.data?.reference}`),
		).toBeVisible();
		await visitor.goto("/cotizar");
		for (const [label, value] of [
			["Razón social", `Empresa ${run}`],
			["NIT", "E2E-12345"],
			["Representante legal", "Persona E2E"],
			["Email corporativo", email],
			["Teléfono", "+530000000"],
			["Año de fundación", "2020"],
			[
				"Descripción del negocio",
				"Empresa sintética creada para verificar el registro RIE-BVH sin servicios externos.",
			],
		]) {
			await visitor.getByLabel(label, { exact: false }).fill(value);
		}
		await visitor
			.getByLabel("Sector", { exact: false })
			.selectOption("Tecnología");
		await visitor
			.getByLabel("Facturación anual", { exact: false })
			.selectOption("50k-100k");
		await visitor
			.getByLabel("Empleados", { exact: false })
			.selectOption("11–50");
		await visitor.getByLabel("Acepto los").check();
		await visitor.getByRole("button", { name: "Enviar solicitud" }).click();
		await expect(
			visitor.getByText(
				"El aviso por correo está pendiente; no necesitas reenviar el formulario.",
			),
		).toBeVisible();
		const application = await service
			.from("company_applications")
			.select("id, accepted_terms_at, employee_count, notification_status")
			.eq("corporate_email", email)
			.single();
		expect(application.error).toBeNull();
		expect(application.data?.notification_status).toBe("failed");
		expect(application.data?.accepted_terms_at).toBeTruthy();
		expect(application.data?.employee_count).toBe(11);
		await signInPage(page, admin.email ?? "", "/admin");
		for (const path of ["/admin/mensajes", "/admin/solicitudes"]) {
			await page.goto(path);
			const row =
				path === "/admin/mensajes"
					? page.getByRole("row").filter({ hasText: email })
					: page
							.locator("div")
							.filter({
								has: page.getByRole("heading", { name: `Empresa ${run}` }),
							})
							.filter({ hasText: email })
							.last();
			await expect(row).toContainText("Falló");
			await expect(
				row.getByRole("button", { name: "Reintentar aviso" }),
			).toBeVisible();
			await visitor.goto(path);
			await expect(visitor).toHaveURL((url) => url.pathname === "/login");
		}
	} finally {
		await visitor.close();
		const contact = await service
			.from("contact_messages")
			.delete()
			.eq("email", email);
		const company = await service
			.from("company_applications")
			.delete()
			.eq("corporate_email", email);
		expect.soft(contact.error).toBeNull();
		expect.soft(company.error).toBeNull();
		await deleteTestUser(admin.id);
	}
});

test("newsletter: alta única, consentimiento, GET inocuo, POST de baja y reactivación", async ({
	page,
	request,
}) => {
	const email = `newsletter-${randomUUID()}@example.test`;
	try {
		await page.goto("/");
		const form = page.locator("form").filter({
			has: page.getByRole("button", {
				name: "Suscribirme al boletín institucional",
			}),
		});
		await form.getByPlaceholder("Nombre", { exact: true }).fill("Persona E2E");
		await form.locator('input[name="email"]').fill(email.toUpperCase());
		await form
			.getByRole("button", { name: "Suscribirme al boletín institucional" })
			.click();
		await expect(form.getByRole("status")).toContainText(
			"Suscripción recibida",
		);
		const first = await service
			.from("newsletter_subscriptions")
			.select(
				"id, is_active, consented_at, unsubscribe_token, notification_attempts, reference",
			)
			.eq("email", email)
			.single();
		expect(first.error).toBeNull();
		if (!first.data) throw new Error("Missing subscription fixture");
		expect(first.data.is_active).toBe(true);
		expect(first.data.consented_at).toBeTruthy();
		const duplicate = await request.post("/api/newsletter", {
			data: { email: ` ${email.toUpperCase()} `, source: "e2e-repeat" },
		});
		expect(duplicate.status()).toBe(200);
		expect(await duplicate.json()).toEqual({
			ok: true,
			alreadySubscribed: true,
		});
		const repeated = await service
			.from("newsletter_subscriptions")
			.select("id, notification_attempts, reference")
			.eq("email", email);
		expect(repeated.data).toHaveLength(1);
		expect(repeated.data?.[0].notification_attempts).toBe(
			first.data.notification_attempts,
		);
		expect(repeated.data?.[0].reference).toBe(first.data.reference);
		const oldToken = first.data.unsubscribe_token;
		await page.goto(`/newsletter/baja?token=${oldToken}`);
		await expect(
			page.getByRole("button", { name: "Confirmar baja" }),
		).toBeVisible();
		const before = await service
			.from("newsletter_subscriptions")
			.select("is_active")
			.eq("id", first.data.id)
			.single();
		expect(before.data?.is_active).toBe(true);
		await page.getByRole("button", { name: "Confirmar baja" }).click();
		await expect(page.getByRole("status")).toHaveText(
			"Tu suscripción quedó desactivada.",
		);
		const inactive = await service
			.from("newsletter_subscriptions")
			.select("is_active, unsubscribed_at")
			.eq("id", first.data.id)
			.single();
		expect(inactive.data?.is_active).toBe(false);
		expect(inactive.data?.unsubscribed_at).toBeTruthy();
		await page.goto(`/newsletter/baja?token=${oldToken}`);
		await page.getByRole("button", { name: "Confirmar baja" }).click();
		await expect(page.getByRole("status")).toContainText("ya estaba inactiva");
		const reactivated = await request.post("/api/newsletter", {
			data: { email, nombre: "Persona E2E", source: "e2e-reactivation" },
		});
		expect(reactivated.status()).toBe(200);
		const response = await reactivated.json();
		expect(response).not.toHaveProperty("unsubscribe_token");
		expect(response).not.toHaveProperty("notification_token");
		const active = await service
			.from("newsletter_subscriptions")
			.select(
				"id, is_active, consented_at, unsubscribe_token, notification_attempts",
			)
			.eq("email", email)
			.single();
		expect(active.data?.id).toBe(first.data.id);
		expect(active.data?.is_active).toBe(true);
		expect(active.data?.consented_at).not.toBe(first.data.consented_at);
		expect(active.data?.unsubscribe_token === oldToken).toBe(false);
		expect(active.data?.notification_attempts).toBe(1);
		await page.goto(`/newsletter/baja?token=${oldToken}`);
		await page.getByRole("button", { name: "Confirmar baja" }).click();
		await expect(page.getByRole("status")).toContainText(
			"el enlace dejó de ser válido",
		);
		const untouched = await service
			.from("newsletter_subscriptions")
			.select("is_active")
			.eq("id", first.data.id)
			.single();
		expect(untouched.data?.is_active).toBe(true);
		await page.goto("/newsletter/baja?token=invalid");
		await expect(
			page.getByRole("button", { name: "Confirmar baja" }),
		).toHaveCount(0);
	} finally {
		const removed = await service
			.from("newsletter_subscriptions")
			.delete()
			.eq("email", email);
		expect.soft(removed.error).toBeNull();
	}
});
