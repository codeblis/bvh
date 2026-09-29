import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { EDITORIAL_PATHS, isEditorialScope } from "@/lib/scope";

vi.mock("server-only", () => ({}));

const original = { ...process.env };

afterEach(() => {
	process.env = { ...original };
	vi.resetModules();
});

test("sin la variable, el alcance es el editorial", () => {
	// Es el valor por defecto a propósito: un despliegue que olvide la variable
	// publica de menos, no de más.
	expect(isEditorialScope(undefined)).toBe(true);
	expect(isEditorialScope("")).toBe(true);
	expect(isEditorialScope("   ")).toBe(true);
});

test("solo un valor explícito de apagado abre el sitio completo", () => {
	for (const value of ["0", "false", "off", "no", "FALSE", " Off "]) {
		expect(isEditorialScope(value)).toBe(false);
	}
	for (const value of ["1", "true", "on", "si", "cualquier-cosa"]) {
		expect(isEditorialScope(value)).toBe(true);
	}
});

test("el alcance editorial publica la portada, noticias, blog y lo legal", () => {
	expect([...EDITORIAL_PATHS]).toEqual([
		"",
		"/noticias",
		"/blog",
		"/privacidad",
		"/terminos",
	]);
});

test("el sitemap editorial no anuncia ninguna ruta que responda 404", async () => {
	process.env.NEXT_PUBLIC_MVP_EDITORIAL = "1";
	process.env.NEXT_PUBLIC_SITE_URL = "https://bvh.test";
	vi.resetModules();
	vi.doMock("@/modules/content/repository.server", () => ({
		listPublishedArticles: vi.fn(async (type: string) =>
			type === "noticia"
				? [{ slug: "una-noticia", date: "2026-09-01T00:00:00.000Z" }]
				: [{ slug: "un-analisis", date: "2026-09-02T00:00:00.000Z" }],
		),
	}));

	const { default: sitemap } = await import("@/app/sitemap");
	const urls = (await sitemap()).map((entry) => entry.url);

	expect(urls).toEqual([
		"https://bvh.test",
		"https://bvh.test/noticias",
		"https://bvh.test/blog",
		"https://bvh.test/privacidad",
		"https://bvh.test/terminos",
		"https://bvh.test/noticias/una-noticia",
		"https://bvh.test/blog/un-analisis",
	]);
	for (const retired of [
		"/indices",
		"/mercados",
		"/cotizar",
		"/instituto",
		"/historia",
		"/acerca",
		"/contacto",
	]) {
		expect(urls).not.toContain(`https://bvh.test${retired}`);
	}
});

test("el sitemap completo vuelve a anunciar todas las secciones", async () => {
	process.env.NEXT_PUBLIC_MVP_EDITORIAL = "0";
	process.env.NEXT_PUBLIC_SITE_URL = "https://bvh.test";
	vi.resetModules();
	vi.doMock("@/modules/content/repository.server", () => ({
		listPublishedArticles: vi.fn(async () => []),
	}));

	const { default: sitemap } = await import("@/app/sitemap");
	const urls = (await sitemap()).map((entry) => entry.url);

	expect(urls).toContain("https://bvh.test/instituto");
	expect(urls).toContain("https://bvh.test/contacto");
	expect(urls).toHaveLength(12);
});

test("en el MVP editorial los endpoints de formulario no existen", async () => {
	process.env.NEXT_PUBLIC_MVP_EDITORIAL = "1";
	// Si el corte fallara y la ruta siguiera viva, la petición llegaría al
	// cliente de servicio; sin él configurado, la prueba lo delataría con un
	// 503 en vez del 404 que se espera.
	process.env.SUPABASE_SERVICE_ROLE_KEY = "";
	vi.resetModules();

	for (const route of [
		"@/app/api/contacto/route",
		"@/app/api/cotizaciones/route",
		"@/app/api/newsletter/route",
	]) {
		const { POST } = await import(route);
		const response = await POST(
			new Request("https://bvh.test/api", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email: "persona@example.test" }),
			}),
		);
		expect(response.status).toBe(404);
	}
});

test("en el MVP editorial no hay callback de identidad", async () => {
	// Confirmar cuenta y recuperar contraseña llegan por correo, y este alcance
	// no envía ninguno: la ruta que los recibe tampoco debe existir.
	process.env.NEXT_PUBLIC_MVP_EDITORIAL = "1";
	vi.resetModules();

	const { GET } = await import("@/app/auth/callback/route");
	const response = await GET(
		new Request("https://bvh.test/auth/callback?code=lo-que-sea"),
	);
	expect(response.status).toBe(404);
});

test("con el sitio completo, esos endpoints vuelven a atender", async () => {
	process.env.NEXT_PUBLIC_MVP_EDITORIAL = "0";
	vi.resetModules();

	const { POST } = await import("@/app/api/newsletter/route");
	const response = await POST(
		new Request("https://bvh.test/api/newsletter", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({}),
		}),
	);
	// Un cuerpo inválido es 400: la ruta existe y valida, que es lo que importa.
	expect(response.status).toBe(400);
});

beforeEach(() => {
	vi.resetModules();
});
