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
