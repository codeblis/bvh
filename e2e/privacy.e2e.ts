import { randomUUID } from "node:crypto";
import { expect, test } from "@playwright/test";
import { createTestUser, deleteTestUser, service, signInPage } from "./local";

// Marcas que jamás deben viajar al navegador.
const SECRETS = [
	process.env.E2E_SUPABASE_SERVICE_ROLE_KEY ?? "",
	"SUPABASE_SERVICE_ROLE_KEY",
	"re_local_stub_key",
	"RESEND_API_KEY",
].filter(Boolean);

const SQL_MARKERS = [
	"invalid input syntax",
	"permission denied for",
	"duplicate key value",
	'relation "public.',
	"pg_catalog",
];

test("ninguna página pública entrega secretos de servidor, ni en el HTML ni en sus scripts", async ({
	page,
	request,
}) => {
	const paths = [
		"/",
		"/noticias",
		"/blog",
		"/instituto",
		"/contacto",
		"/login",
	];
	for (const path of paths) {
		const response = await request.get(path);
		expect(response.status(), path).toBeLessThan(400);
		const html = await response.text();
		for (const secret of SECRETS)
			expect(html, `${path} · ${secret}`).not.toContain(secret);
	}

	// Los scripts que la home carga tampoco pueden llevarlos embebidos.
	await page.goto("/");
	const scripts = await page
		.locator("script[src]")
		.evaluateAll((nodes) =>
			nodes.map(
				(node) => (node as HTMLScriptElement).getAttribute("src") ?? "",
			),
		);
	expect(scripts.length).toBeGreaterThan(0);
	for (const src of scripts) {
		const asset = await request.get(src);
		if (asset.status() >= 400) continue;
		const body = await asset.text();
		for (const secret of SECRETS) expect(body, src).not.toContain(secret);
	}
});

test("los errores no exponen SQL ni detalles del proveedor al navegador", async ({
	page,
	request,
}) => {
	const run = randomUUID().slice(0, 8);
	const admin = await createTestUser(`privacy-admin-${run}@example.test`, true);
	try {
		// Fallo real de consulta detrás de una sesión administrativa.
		await signInPage(page, admin.email ?? "", "/admin");
		await page.goto("/admin/empresas/no-es-un-uuid");
		await expect(
			page.getByRole("heading", { name: "No se pudo cargar esta sección" }),
		).toBeVisible();
		const html = await page.content();
		for (const marker of SQL_MARKERS)
			expect(html, marker).not.toContain(marker);
		for (const secret of SECRETS) expect(html).not.toContain(secret);

		// La API pública responde con un texto único y sin motivo interno.
		const invalid = await request.post("/api/contacto", {
			headers: { "Content-Type": "application/json" },
			data: "{",
		});
		expect(invalid.status()).toBe(400);
		expect(await invalid.json()).toEqual({
			ok: false,
			message: "Revisa los datos e inténtalo nuevamente.",
		});
	} finally {
		await deleteTestUser(admin.id);
	}
});

test("la respuesta pública de un formulario solo devuelve la referencia visible", async ({
	request,
}) => {
	const email = `privacy-${randomUUID()}@example.test`;
	try {
		const response = await request.post("/api/contacto", {
			data: {
				nombre: "Persona E2E",
				email,
				asunto: "Otro",
				mensaje: "Mensaje sintético para revisar la respuesta pública.",
			},
		});
		expect(response.status()).toBe(200);
		const payload = await response.json();
		expect(Object.keys(payload).sort()).toEqual([
			"notification",
			"ok",
			"reference",
		]);

		// La referencia del acuse no permite deducir el identificador interno.
		const stored = await service
			.from("contact_messages")
			.select("id, reference, notification_token")
			.eq("email", email)
			.single();
		expect(stored.data?.reference).toBe(payload.reference);
		expect(payload.reference).not.toContain(stored.data?.id ?? "");
		expect(JSON.stringify(payload)).not.toContain(stored.data?.id ?? "");
		expect(stored.data?.notification_token).toBeNull();
	} finally {
		const removed = await service
			.from("contact_messages")
			.delete()
			.eq("email", email);
		expect.soft(removed.error).toBeNull();
	}
});

test("un usuario autenticado no alcanza los datos personales de otros", async ({
	page,
	request,
}) => {
	const run = randomUUID().slice(0, 8);
	const student = await createTestUser(`privacy-user-${run}@example.test`);
	const email = `privacy-form-${run}@example.test`;
	try {
		const submitted = await request.post("/api/newsletter", {
			data: { email, nombre: "Persona ajena", source: "e2e-privacy" },
		});
		expect(submitted.status()).toBe(200);

		await signInPage(page, student.email ?? "", "/cuenta");
		// Su propia área no muestra datos de terceros.
		expect(await page.content()).not.toContain(email);
		// Y las vistas que los contienen le están vedadas.
		for (const path of ["/admin/newsletter", "/admin/mensajes"]) {
			await page.goto(path);
			await expect(page, path).toHaveURL((url) => url.pathname === "/cuenta");
			expect(await page.content(), path).not.toContain(email);
		}
	} finally {
		const removed = await service
			.from("newsletter_subscriptions")
			.delete()
			.eq("email", email);
		expect.soft(removed.error).toBeNull();
		await deleteTestUser(student.id);
	}
});

test("la exportación del newsletter neutraliza fórmulas, queda auditada y se niega a quien no es admin", async ({
	page,
	browser,
}) => {
	const run = randomUUID().slice(0, 8);
	const admin = await createTestUser(`export-admin-${run}@example.test`, true);
	const student = await createTestUser(`export-user-${run}@example.test`);
	const member = await browser.newPage({ baseURL: "http://127.0.0.1:3100" });
	// Un suscriptor cuyo nombre es una fórmula de hoja de cálculo.
	const email = `export-${run}@example.test`;
	const attack = "=cmd|' /C calc'!A0";
	const seeded = await service.from("newsletter_subscriptions").insert({
		email,
		full_name: attack,
		source: "e2e-export",
		consented_at: new Date().toISOString(),
		reference: `BVH-NEWS-EXP${run.toUpperCase()}`,
	});
	expect(seeded.error).toBeNull();
	try {
		await signInPage(page, admin.email ?? "", "/admin");
		await page.goto("/admin/newsletter");
		const link = page.getByRole("link", { name: "Exportar CSV" });
		await expect(link).toBeVisible();

		const response = await page.request.get("/admin/newsletter/exportar");
		expect(response.status()).toBe(200);
		expect(response.headers()["content-type"]).toContain("text/csv");
		expect(response.headers()["content-disposition"]).toContain(
			'attachment; filename="newsletter-',
		);
		const csv = await response.text();
		expect(csv).toContain(email);
		// El nombre viaja íntegro pero desactivado: ninguna celda empieza por «=».
		expect(csv).toContain(`'${attack}`);
		expect(csv).not.toMatch(/(^|,|\n)=/);

		// La descarga queda registrada con actor y volumen, sin el contenido.
		const audited = await service
			.from("audit_events")
			.select("action, resource_type, actor_id, metadata")
			.eq("action", "export")
			.order("created_at", { ascending: false })
			.limit(1)
			.single();
		expect(audited.error).toBeNull();
		expect(audited.data?.resource_type).toBe("newsletter_subscriptions");
		expect(audited.data?.actor_id).toBe(admin.id);
		expect(
			Number((audited.data?.metadata as { rows?: number })?.rows),
		).toBeGreaterThan(0);
		expect(JSON.stringify(audited.data?.metadata)).not.toContain(email);

		// Ni un usuario autenticado sin rol ni un visitante obtienen el archivo.
		await signInPage(member, student.email ?? "", "/cuenta");
		const denied = await member.request.get("/admin/newsletter/exportar", {
			maxRedirects: 0,
		});
		expect(denied.status()).toBeGreaterThanOrEqual(300);
		expect(await denied.text()).not.toContain(email);
	} finally {
		await member.close();
		await service.from("newsletter_subscriptions").delete().eq("email", email);
		await deleteTestUser(student.id);
		await deleteTestUser(admin.id);
	}
});
