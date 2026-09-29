import { randomUUID } from "node:crypto";
import { expect, test } from "@playwright/test";
import { createTestUser, deleteTestUser, service, signInPage } from "./local";

/**
 * Recorridos del MVP editorial. Se ejecutan sobre un build propio, con
 * `NEXT_PUBLIC_MVP_EDITORIAL=1`, porque la bandera se incrusta al construir:
 *
 *   pnpm test:e2e:mvp
 *
 * La tanda ordinaria (`pnpm test:e2e`) construye con el sitio completo y cubre
 * formularios, cursos y campañas. Las dos cosas no caben en un mismo servidor.
 */

const BASE = "http://127.0.0.1:3100";

const RETIRED_PAGES = [
	"/acerca",
	"/historia",
	"/contacto",
	"/cotizar",
	"/indices",
	"/mercados",
	"/instituto",
	"/instituto/cursos/cualquiera",
	"/registro",
	"/cuenta",
	// Dependen del envío de correo, que este alcance no tiene.
	"/recuperar-password",
	"/actualizar-password",
];

const RETIRED_ENDPOINTS = [
	"/api/contacto",
	"/api/cotizaciones",
	"/api/newsletter",
];

test("las secciones fuera del MVP responden 404, no un aviso de «en preparación»", async ({
	page,
}) => {
	for (const path of RETIRED_PAGES) {
		const response = await page.goto(path);
		expect(response?.status(), path).toBe(404);
		await expect(page.getByRole("heading", { level: 1 })).toHaveText(
			"Esta página no existe",
		);
	}
});

test("los endpoints de formulario público no existen", async ({ request }) => {
	for (const path of RETIRED_ENDPOINTS) {
		const response = await request.post(path, { data: {} });
		expect(response.status(), path).toBe(404);
	}
	// El callback de identidad solo sirve a enlaces que llegan por correo.
	const callback = await request.get("/auth/callback?code=lo-que-sea");
	expect(callback.status()).toBe(404);
});

test("el acceso al panel no ofrece ni registro ni recuperación por correo", async ({
	page,
}) => {
	await page.goto("/login");
	await expect(page.getByRole("link", { name: "Regístrate" })).toHaveCount(0);
	await expect(
		page.getByRole("link", { name: "¿Olvidaste tu contraseña?" }),
	).toHaveCount(0);
	// Lo único que queda es entrar con contraseña, que no envía ningún correo.
	await expect(page.locator('input[name="password"]')).toBeVisible();
});

test("la navegación ofrece Inicio, Noticias y Blog, y nada más", async ({
	page,
}) => {
	await page.goto("/");
	const nav = page.getByRole("navigation").first();
	await expect(nav.getByRole("link", { name: "Inicio" })).toBeVisible();
	await expect(nav.getByRole("link", { name: "Noticias" })).toBeVisible();
	await expect(nav.getByRole("link", { name: "Blog" })).toBeVisible();
	for (const label of [
		"Índices",
		"Mercados",
		"Instituto",
		"Cotizar",
		"Historia",
		"Contacto",
	]) {
		await expect(nav.getByRole("link", { name: label }), label).toHaveCount(0);
	}
});

test("ninguna página publicada pide un correo ni muestra cotizaciones simuladas", async ({
	page,
}) => {
	for (const path of ["/", "/noticias", "/blog", "/terminos", "/privacidad"]) {
		await page.goto(path);
		// Sin formularios públicos no hay ningún campo de correo que rellenar.
		await expect(page.locator('input[type="email"]'), path).toHaveCount(0);
		// El ticker se anuncia con esa etiqueta accesible; no debe existir.
		await expect(page.getByText("Datos simulados"), path).toHaveCount(0);
	}
});

test("el sitemap anuncia solo lo publicado y robots sigue excluyendo lo privado", async ({
	request,
}) => {
	const sitemap = await request.get("/sitemap.xml");
	expect(sitemap.status()).toBe(200);
	const xml = await sitemap.text();
	for (const path of ["", "/noticias", "/blog", "/privacidad", "/terminos"]) {
		expect(xml, path).toContain(`<loc>${BASE}${path}</loc>`);
	}
	for (const path of RETIRED_PAGES) {
		expect(xml, path).not.toContain(`<loc>${BASE}${path}</loc>`);
	}

	const robots = await request.get("/robots.txt");
	const body = await robots.text();
	expect(body).toContain("Disallow: /admin");
	expect(body).toContain(`Sitemap: ${BASE}/sitemap.xml`);
});

test("publicar desde el panel aparece en la portada, en el índice y en su detalle", async ({
	page,
}) => {
	const run = randomUUID().slice(0, 8);
	const admin = await createTestUser(`mvp-admin-${run}@example.test`, true);
	const slug = `mvp-noticia-${run}`;
	const title = `Noticia del MVP ${run}`;
	const created = await service
		.from("articles")
		.insert({
			title,
			slug,
			type: "noticia",
			status: "publicado",
			excerpt:
				"Extracto sintético para comprobar que la portada editorial muestra lo último publicado.",
			content: "Cuerpo sintético de la noticia del MVP editorial.",
			author_id: admin.id,
			published_at: new Date().toISOString(),
		})
		.select("id")
		.single();
	expect(created.error).toBeNull();

	try {
		// La portada lee de la base en cada petición: lo publicado sale sin
		// necesidad de volver a desplegar.
		await page.goto("/");
		await expect(page.getByRole("link", { name: title })).toBeVisible();

		await page.goto("/noticias");
		await expect(page.getByRole("link", { name: title })).toBeVisible();

		const detail = await page.goto(`/noticias/${slug}`);
		expect(detail?.status()).toBe(200);
		await expect(page.getByRole("heading", { level: 1 })).toContainText(title);

		// El panel conserva el trabajo editorial y deja fuera lo que no se publica.
		await signInPage(page, admin.email ?? "", "/admin");
		const panelNav = page.getByRole("navigation", {
			name: "Secciones del panel",
		});
		await expect(
			panelNav.getByRole("link", { name: "Artículos" }),
		).toBeVisible();
		await expect(
			panelNav.getByRole("link", { name: "Categorías" }),
		).toBeVisible();
		for (const label of [
			"Mensajes de contacto",
			"Solicitudes RIE-BVH",
			"Campañas",
			"Cursos",
			"Empresas",
		]) {
			await expect(
				panelNav.getByRole("link", { name: label }),
				label,
			).toHaveCount(0);
		}
	} finally {
		const removed = await service.from("articles").delete().eq("slug", slug);
		expect.soft(removed.error).toBeNull();
		await deleteTestUser(admin.id);
	}
});

test("la portada explica el estado del proyecto sin prometer módulos que no existen", async ({
	page,
}) => {
	await page.goto("/");
	await expect(
		page.getByText("está en preparación", { exact: false }),
	).toBeVisible();
	await expect(
		page.getByRole("link", { name: "Leer las noticias" }),
	).toBeVisible();
	await expect(
		page.getByRole("link", { name: "Análisis del blog →" }),
	).toBeVisible();
});
