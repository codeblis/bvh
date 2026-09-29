import { randomUUID } from "node:crypto";
import { expect, test } from "@playwright/test";
import { createTestUser, deleteTestUser, service, signInPage } from "./local";

const BASE = "http://127.0.0.1:3100";

type Page = import("@playwright/test").Page;

async function head(page: Page, selector: string) {
	const tag = page.locator(selector).first();
	return (await tag.count()) ? await tag.getAttribute("content") : null;
}

// Ausencia de la etiqueta equivale a indexable: se compara sobre texto vacío.
async function robotsMeta(page: Page) {
	return (await head(page, 'meta[name="robots"]')) ?? "";
}

test("robots.txt permite el sitio, excluye las áreas privadas y declara el sitemap", async ({
	request,
}) => {
	const response = await request.get("/robots.txt");
	expect(response.status()).toBe(200);
	const body = await response.text();
	expect(body).toContain("User-Agent: *");
	expect(body).toContain("Allow: /");
	for (const path of [
		"/admin",
		"/cuenta",
		"/auth",
		"/newsletter",
		"/actualizar-password",
	]) {
		expect(body, path).toContain(`Disallow: ${path}`);
	}
	expect(body).toContain(`Sitemap: ${BASE}/sitemap.xml`);
	// El sitemap y el host usan el origen configurado, no el dominio productivo.
	expect(body).not.toContain("bolsadelahabana.com");
});

test("home e índices declaran title, description y canonical propios", async ({
	page,
}) => {
	const pages = [
		{ path: "/", canonical: BASE, title: /Bolsa de Valores de La Habana/ },
		{ path: "/noticias", canonical: `${BASE}/noticias`, title: /^Noticias \|/ },
		{ path: "/blog", canonical: `${BASE}/blog`, title: /^Blog \|/ },
		{
			path: "/instituto",
			canonical: `${BASE}/instituto`,
			title: /^Instituto \|/,
		},
		{
			path: "/acerca",
			canonical: `${BASE}/acerca`,
			title: /^Acerca de la BVH \|/,
		},
		{ path: "/historia", canonical: `${BASE}/historia`, title: /^Historia \|/ },
		{ path: "/contacto", canonical: `${BASE}/contacto`, title: /^Contacto \|/ },
	];
	const seen = new Map<string, string>();
	for (const entry of pages) {
		await page.goto(entry.path);
		const title = await page.title();
		expect(title, entry.path).toMatch(entry.title);
		const description = await head(page, 'meta[name="description"]');
		expect(description?.length ?? 0, entry.path).toBeGreaterThan(50);
		expect(
			await page.locator('link[rel="canonical"]').getAttribute("href"),
			entry.path,
		).toBe(entry.canonical);
		expect(
			await head(page, 'meta[property="og:title"]'),
			entry.path,
		).toBeTruthy();
		// El título no se repite entre secciones.
		for (const [otherPath, otherTitle] of seen) {
			expect(title, `${entry.path} vs ${otherPath}`).not.toBe(otherTitle);
		}
		seen.set(entry.path, title);
		expect(await robotsMeta(page), entry.path).not.toContain("noindex");
	}
});

test("las áreas privadas y con token declaran noindex", async ({
	page,
	browser,
}) => {
	const run = randomUUID();
	const student = await createTestUser(`seo-user-${run}@example.test`);
	const context = await browser.newPage({ baseURL: BASE });
	try {
		await signInPage(context, student.email ?? "", "/cuenta");
		expect(await robotsMeta(context)).toContain("noindex");

		await page.goto("/actualizar-password");
		expect(await robotsMeta(page)).toContain("noindex");

		await page.goto("/newsletter/baja?token=invalid");
		expect(await robotsMeta(page)).toContain("noindex");

		// Identidad: título y canonical propios, pero fuera del índice.
		for (const path of ["/login", "/registro", "/recuperar-password"]) {
			await page.goto(path);
			expect(await robotsMeta(page), path).toContain("noindex");
			expect(await page.title(), path).not.toMatch(
				/^BVH \| Bolsa de Valores de La Habana$/,
			);
			expect(
				await page.locator('link[rel="canonical"]').getAttribute("href"),
				path,
			).toBe(`${BASE}${path}`);
		}
	} finally {
		await context.close();
		await deleteTestUser(student.id);
	}
});

test("el detalle publicado se indexa y aparece en el sitemap; el borrador y su preview no", async ({
	page,
	request,
}) => {
	const run = randomUUID().slice(0, 8);
	const admin = await createTestUser(`seo-admin-${run}@example.test`, true);
	const published = {
		title: `Publicada SEO ${run}`,
		slug: `publicada-seo-${run}`,
	};
	const draft = { title: `Borrador SEO ${run}`, slug: `borrador-seo-${run}` };
	const created = await service
		.from("articles")
		.insert([
			{
				title: published.title,
				slug: published.slug,
				type: "noticia",
				status: "publicado",
				excerpt:
					"Extracto sintético de una noticia publicada para verificar la indexación y el sitemap.",
				content: "Cuerpo sintético de la noticia publicada.",
				author_id: admin.id,
				published_at: new Date().toISOString(),
			},
			{
				title: draft.title,
				slug: draft.slug,
				type: "noticia",
				status: "borrador",
				excerpt: "Extracto privado que no debe indexarse.",
				content: "Cuerpo sintético del borrador.",
				author_id: admin.id,
			},
		])
		.select("id, slug, status");
	expect(created.error).toBeNull();
	const draftId = created.data?.find((row) => row.status === "borrador")?.id;
	try {
		await page.goto(`/noticias/${published.slug}`);
		expect(await page.title()).toContain(published.title);
		expect(
			await page.locator('link[rel="canonical"]').getAttribute("href"),
		).toBe(`${BASE}/noticias/${published.slug}`);
		expect(await head(page, 'meta[property="og:type"]')).toBe("article");
		expect(await robotsMeta(page)).not.toContain("noindex");

		const sitemap = await request.get("/sitemap.xml");
		expect(sitemap.status()).toBe(200);
		const xml = await sitemap.text();
		expect(xml).toContain(`${BASE}/noticias/${published.slug}`);
		expect(xml).not.toContain(draft.slug);
		expect(xml).toContain(`<loc>${BASE}</loc>`);

		const hidden = await page.goto(`/noticias/${draft.slug}`);
		expect(hidden?.status()).toBe(404);

		// La vista previa del borrador existe para el CMS, pero se declara noindex.
		await signInPage(page, admin.email ?? "", "/admin");
		await page.goto(`/admin/articulos/${draftId}/preview`);
		expect(await robotsMeta(page)).toContain("noindex");
	} finally {
		const removed = await service
			.from("articles")
			.delete()
			.in("slug", [published.slug, draft.slug]);
		expect.soft(removed.error).toBeNull();
		await deleteTestUser(admin.id);
	}
});
