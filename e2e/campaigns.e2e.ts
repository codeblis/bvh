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

test("una campaña a una lista solo alcanza el consentimiento vigente", async ({
	page,
}) => {
	test.setTimeout(120_000);
	const run = randomUUID();
	const subject = `Boletín E2E ${run.slice(0, 8)}`;
	const admin = await createTestUser(`camp-admin-${run}@example.test`, true);
	const live = `camp-live-${run}@example.test`;
	const listOptOut = `camp-list-${run}@example.test`;
	const globalOptOut = `camp-global-${run}@example.test`;
	const emails = [live, listOptOut, globalOptOut];

	try {
		await setEmailStub("accept", true);

		const list = await service
			.from("newsletter_lists")
			.select("id")
			.eq("slug", "noticias")
			.single();
		expect(list.error).toBeNull();

		// Tres personas en la misma lista, con tres situaciones distintas.
		for (const [email, listActive, personActive] of [
			[live, true, true],
			[listOptOut, false, true],
			[globalOptOut, true, false],
		] as const) {
			const person = await service
				.from("newsletter_subscriptions")
				.insert({ email, full_name: "Persona E2E", is_active: personActive })
				.select("id")
				.single();
			expect(person.error, email).toBeNull();
			const consent = await service
				.from("newsletter_list_subscriptions")
				.insert({
					subscriber_id: person.data?.id ?? "",
					list_id: list.data?.id ?? "",
					is_active: listActive,
				});
			expect(consent.error, email).toBeNull();
		}

		await signInPage(page, admin.email ?? "", "/admin");
		await page.goto("/admin/campanas/nueva");
		await page.getByLabel("Asunto").fill(subject);
		await page
			.getByLabel("Audiencia")
			.selectOption("lista");
		await page.getByLabel("Lista").selectOption({ label: "Noticias" });
		await page
			.getByLabel("Cuerpo")
			.fill("## Hola\n\nEste es el **boletín** de prueba.");
		await page.getByRole("button", { name: "Guardar borrador" }).click();
		await expect(page.getByRole("status")).toHaveText("Borrador guardado.");

		page.once("dialog", (dialog) => dialog.accept());
		await page.getByRole("button", { name: "Enviar ahora" }).click();
		await expect(page.getByRole("status")).toContainText("Envío terminado");

		// Solo la persona con consentimiento vigente aparece y recibe.
		const rows = page.getByRole("row");
		await expect(rows.filter({ hasText: live })).toContainText("Enviado");
		await expect(rows.filter({ hasText: listOptOut })).toHaveCount(0);
		await expect(rows.filter({ hasText: globalOptOut })).toHaveCount(0);

		const attempts = await emailStubAttempts();
		expect(attempts).toHaveLength(1);
		expect(attempts[0].to).toEqual(live);
		expect(attempts[0].subject).toBe(subject);
		expect(attempts[0].idempotencyKey).toMatch(/^BVH-CAMP-/);

		const campaign = await service
			.from("newsletter_campaigns")
			.select("id, status, sent_at")
			.eq("subject", subject)
			.single();
		expect(campaign.data?.status).toBe("enviada");
		expect(campaign.data?.sent_at).toBeTruthy();

		// Una campaña enviada ya no se edita ni se reenvía desde el panel.
		await expect(
			page.getByRole("button", { name: "Enviar ahora" }),
		).toHaveCount(0);
		await expect(
			page.getByRole("button", { name: "Guardar borrador" }),
		).toHaveCount(0);
	} finally {
		const campaign = await service
			.from("newsletter_campaigns")
			.select("id")
			.eq("subject", subject)
			.maybeSingle();
		if (campaign.data?.id) {
			await service
				.from("newsletter_campaigns")
				.delete()
				.eq("id", campaign.data.id);
		}
		for (const email of emails) {
			await service.from("newsletter_subscriptions").delete().eq("email", email);
		}
		await deleteTestUser(admin.id);
	}
});
