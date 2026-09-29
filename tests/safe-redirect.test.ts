import { expect, test } from "vitest";
import { getSafeAuthRedirect } from "../src/lib/safe-redirect.ts";

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
