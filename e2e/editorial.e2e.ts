import { expect, type Page, test } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.E2E_SUPABASE_URL as string;
const serviceRoleKey = process.env.E2E_SUPABASE_SERVICE_ROLE_KEY as string;
const adminEmail = "e2e-editorial-admin@example.test";
const adminPassword = "local-e2e-password";
const articlePrefix = "e2e-editorial-";
const png = Buffer.from(
	"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
	"base64",
);

const service = createClient(supabaseUrl, serviceRoleKey, {
	auth: { persistSession: false, autoRefreshToken: false },
});

let adminId: string | undefined;

async function cleanup() {
	const { data: articles } = await service
		.from("articles")
		.select("id, featured_image_path")
		.like("slug", `${articlePrefix}%`);
	const paths = (articles ?? [])
		.map((article) => article.featured_image_path)
		.filter((path): path is string =>
			Boolean(path && !/^https?:\/\//i.test(path)),
		);
	if (paths.length > 0) await service.storage.from("editorial").remove(paths);
	await service.from("articles").delete().like("slug", `${articlePrefix}%`);

	if (adminId) {
		await service.from("profiles").delete().eq("id", adminId);
		await service.auth.admin.deleteUser(adminId);
		adminId = undefined;
	}

	const { data: listed } = await service.auth.admin.listUsers();
	const staleAdmin = listed.users.find((user) => user.email === adminEmail);
	if (staleAdmin) {
		await service.from("profiles").delete().eq("id", staleAdmin.id);
		await service.auth.admin.deleteUser(staleAdmin.id);
	}
}

async function login(page: Page) {
	await page.goto("/login?callbackUrl=/admin");
	await page.getByLabel("Email").fill(adminEmail);
	await page.getByLabel("Contraseña").fill(adminPassword);
	await page.getByRole("button", { name: "Iniciar sesión" }).click();
	await expect
		.poll(async () =>
			(await page.context().cookies()).some(
				(cookie) =>
					cookie.name.startsWith("sb-") && cookie.name.includes("auth-token"),
			),
		)
		.toBe(true);
	await expect(page).toHaveURL((url) => url.pathname === "/admin");
	await expect(page.getByRole("heading", { name: "Resumen" })).toBeVisible();
}

async function exerciseArticle(
	page: Page,
	visitor: Page,
	type: "noticia" | "blog",
	sequence: number,
) {
	const section = type === "noticia" ? "noticias" : "blog";
	const otherSection = type === "noticia" ? "blog" : "noticias";
	const slug = `${articlePrefix}${type}-${sequence}`;
	const title = `E2E ${type} ${sequence}`;
	const editedTitle = `${title} editada`;
	const excerpt = `Extracto verificable de ${type} para metadata y listado.`;
	const alt = `Portada geométrica de prueba para ${type}`;

	await page.goto("/admin/articulos/nuevo");
	await page.getByLabel("Título", { exact: true }).fill(title);
	await page.getByLabel("Slug").fill(slug);
	await page.getByLabel("Extracto").fill(excerpt);
	await page
		.getByLabel("Contenido")
		.fill(
			`## Encabezado ${type}\n\nContenido inicial verificable para ${type}.`,
		);
	await page.getByLabel("Tipo").selectOption(type);
	await page.getByLabel("Categoría").selectOption({ label: "Educación" });
	await page
		.getByRole("combobox", { name: /^Estado/ })
		.selectOption("borrador");
	await page.getByRole("button", { name: "Guardar" }).click();
	await expect(page).toHaveURL(/\/admin\/articulos\/[0-9a-f-]+\?saved=true$/);
	await expect(page.getByRole("status")).toContainText("Artículo guardado");

	const editorUrl = page.url().replace(/\?saved=true$/, "");
	const draftResponse = await visitor.request.get(`/${section}/${slug}`);
	expect(draftResponse.status()).toBe(404);
	expect(await draftResponse.text()).not.toContain(excerpt);
	await visitor.goto(`${editorUrl}/preview`);
	await expect(visitor).toHaveURL((url) => url.pathname === "/login");

	await page.getByRole("link", { name: "Vista previa" }).click();
	await expect(page.getByText("Vista previa privada")).toBeVisible();
	await expect(page.getByRole("heading", { name: title })).toBeVisible();
	expect(
		await page.locator('meta[name="robots"]').getAttribute("content"),
	).toContain("noindex");

	await page.goto(editorUrl);
	await page.getByLabel("Texto alternativo").fill(alt);
	await page.getByLabel("Archivo").setInputFiles({
		name: `${slug}.png`,
		mimeType: "image/png",
		buffer: png,
	});
	await page.getByRole("button", { name: "Subir portada" }).click();
	await expect(page).toHaveURL(/cover=updated/);
	await expect(page.getByRole("status")).toContainText("Portada actualizada");

	await page
		.getByRole("combobox", { name: /^Estado/ })
		.selectOption("publicado");
	await page.getByRole("button", { name: "Guardar" }).click();
	await expect(page).toHaveURL(/saved=true/);

	await visitor.goto(`/${section}/${slug}`);
	await expect(visitor.getByRole("heading", { name: title })).toBeVisible();
	const cover = visitor.getByRole("img", { name: alt });
	await expect(cover).toBeVisible();
	await expect
		.poll(() => cover.evaluate((image: HTMLImageElement) => image.naturalWidth))
		.toBeGreaterThan(0);
	await expect(visitor).toHaveTitle(
		type === "noticia" ? `${title} | BVH` : `${title} | Blog BVH`,
	);
	expect(
		await visitor.locator('meta[name="description"]').getAttribute("content"),
	).toBe(excerpt);
	expect(
		await visitor.locator('link[rel="canonical"]').getAttribute("href"),
	).toBe(`http://127.0.0.1:3100/${section}/${slug}`);
	expect(
		await visitor.locator('meta[property="og:type"]').getAttribute("content"),
	).toBe("article");

	expect((await visitor.request.get(`/${otherSection}/${slug}`)).status()).toBe(
		404,
	);
	await visitor.goto(`/${section}`);
	await expect(
		visitor.getByRole("heading", { name: title, exact: true }).first(),
	).toBeVisible();
	await visitor.goto(`/${otherSection}`);
	await expect(visitor.getByText(title, { exact: true })).toHaveCount(0);

	const sitemapPublished = await visitor.request.get("/sitemap.xml");
	expect(sitemapPublished.ok()).toBe(true);
	expect(await sitemapPublished.text()).toContain(`/${section}/${slug}`);

	await page.goto(editorUrl);
	await page.getByLabel("Título", { exact: true }).fill(editedTitle);
	await page
		.getByLabel("Contenido")
		.fill(
			`## Encabezado editado\n\nContenido actualizado y verificable para ${type}.`,
		);
	await page.getByRole("button", { name: "Guardar" }).click();
	await expect(page).toHaveURL(/saved=true/);
	await visitor.goto(`/${section}/${slug}`);
	await expect(
		visitor.getByRole("heading", { name: editedTitle }),
	).toBeVisible();
	await expect(
		visitor.getByText("Contenido actualizado y verificable"),
	).toBeVisible();

	await page.goto("/admin/articulos");
	const row = page.getByRole("row").filter({ hasText: editedTitle });
	page.once("dialog", (dialog) => dialog.accept());
	await row.getByRole("button", { name: "Despublicar" }).click();
	await expect(row.getByRole("button", { name: "Despublicar" })).toHaveCount(0);

	expect((await visitor.request.get(`/${section}/${slug}`)).status()).toBe(404);
	const sitemapDraft = await visitor.request.get("/sitemap.xml");
	expect(await sitemapDraft.text()).not.toContain(`/${section}/${slug}`);
}

test.describe
	.serial("flujo editorial V1", () => {
		test.beforeAll(async () => {
			await cleanup();
			const created = await service.auth.admin.createUser({
				email: adminEmail,
				password: adminPassword,
				email_confirm: true,
				user_metadata: { nombre: "Editorial E2E", tipo: "individual" },
			});
			expect(created.error).toBeNull();
			adminId = created.data.user?.id;
			expect(adminId).toBeTruthy();
			const promoted = await service
				.from("profiles")
				.update({ role: "admin" })
				.eq("id", adminId as string);
			expect(promoted.error).toBeNull();
		});

		test.afterAll(cleanup);

		test("noticia: borrador, preview, publicación, edición y despublicación", async ({
			page,
			browser,
		}) => {
			await login(page);
			const visitor = await browser.newPage({
				baseURL: "http://127.0.0.1:3100",
			});
			try {
				await exerciseArticle(page, visitor, "noticia", 1);
			} finally {
				await visitor.close();
			}
		});

		test("blog: borrador, preview, publicación, edición y despublicación", async ({
			page,
			browser,
		}) => {
			await login(page);
			const visitor = await browser.newPage({
				baseURL: "http://127.0.0.1:3100",
			});
			try {
				await exerciseArticle(page, visitor, "blog", 2);
			} finally {
				await visitor.close();
			}
		});
	});
