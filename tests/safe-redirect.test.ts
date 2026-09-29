import { afterEach, beforeEach, expect, test, vi } from "vitest";
import {
	defaultAuthDestination,
	getSafeAuthRedirect,
} from "../src/lib/safe-redirect.ts";

// Esta lista de destinos es la del sitio completo. El MVP editorial recorta la
// suya —solo el panel— y se comprueba aparte al final.
beforeEach(() => vi.stubEnv("NEXT_PUBLIC_MVP_EDITORIAL", "0"));
afterEach(() => vi.unstubAllEnvs());

test("acepta únicamente destinos internos autorizados", () => {
	expect(getSafeAuthRedirect("/cuenta")).toBe("/cuenta");
	expect(getSafeAuthRedirect("/admin/articulos?status=borrador")).toBe(
		"/admin/articulos?status=borrador",
	);
	expect(getSafeAuthRedirect("/actualizar-password")).toBe(
		"/actualizar-password",
	);
	expect(getSafeAuthRedirect("/instituto/cursos/valoracion")).toBe(
		"/instituto/cursos/valoracion",
	);
});

test("rechaza redirecciones externas, codificadas o ambiguas", () => {
	for (const destination of [
		"https://example.com",
		"//example.com",
		"/%2F%2Fexample.com",
		"/\\example.com",
		"/otra-ruta",
		" /admin",
		"/admin/../../otra-ruta",
		"/admin/%2e%2e/otra-ruta",
		"/admin/%252e%252e/otra-ruta",
		"/admin/%255cexample.com",
		"/admin/%00",
		"/admin/%",
	]) {
		expect(getSafeAuthRedirect(destination)).toBe("/cuenta");
	}
});

test("en el MVP editorial el único destino es el panel", () => {
	vi.stubEnv("NEXT_PUBLIC_MVP_EDITORIAL", "1");

	// Tras entrar no hay área personal a la que ir: `/cuenta` responde 404.
	expect(defaultAuthDestination()).toBe("/admin");
	expect(getSafeAuthRedirect(null)).toBe("/admin");

	// Y un destino retirado no se respeta ni viniendo en la URL, porque
	// llevaría a una página que no existe.
	expect(getSafeAuthRedirect("/cuenta")).toBe("/admin");
	expect(getSafeAuthRedirect("/instituto/cursos/valoracion")).toBe("/admin");
	expect(getSafeAuthRedirect("/actualizar-password")).toBe("/admin");

	// El panel sigue aceptándose con su consulta intacta.
	expect(getSafeAuthRedirect("/admin/articulos?status=borrador")).toBe(
		"/admin/articulos?status=borrador",
	);
});
