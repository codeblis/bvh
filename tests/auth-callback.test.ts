import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { GET } from "../src/app/auth/callback/route";

const { exchange } = vi.hoisted(() => ({ exchange: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({
	createClient: async () => ({ auth: { exchangeCodeForSession: exchange } }),
}));
beforeEach(() => {
	// El callback solo existe con el sitio completo: sirve a los enlaces de
	// confirmación y recuperación, que llegan por correo. En el MVP editorial
	// responde 404, y eso se comprueba en scope.test.ts.
	vi.stubEnv("NEXT_PUBLIC_MVP_EDITORIAL", "0");
	vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://bvh.example.test");
	exchange.mockReset().mockResolvedValue({ error: null });
});
afterEach(() => vi.unstubAllEnvs());

test("callback usa origen canónico, no el host interno del servidor", async () => {
	const response = await GET(
		new Request(
			"http://internal:3100/auth/callback?code=synthetic&next=/cuenta",
		),
	);
	expect(response.headers.get("location")).toBe(
		"https://bvh.example.test/cuenta",
	);
	expect(response.headers.get("cache-control")).toBe("no-store");
});
test("callback con código válido rechaza destinos hostiles", async () => {
	for (const next of [
		"https://attacker.test",
		"//attacker.test",
		"/admin/../../otra-ruta",
		"/admin/%255cattacker.test",
	]) {
		const response = await GET(
			new Request(
				`http://internal/auth/callback?code=synthetic&next=${encodeURIComponent(next)}`,
			),
		);
		expect(response.headers.get("location")).toBe(
			"https://bvh.example.test/cuenta",
		);
	}
});
test("callback inválido o proveedor caído retorna error genérico", async () => {
	exchange.mockRejectedValue(new Error("private provider detail"));
	const response = await GET(
		new Request("http://internal/auth/callback?code=synthetic"),
	);
	expect(response.headers.get("location")).toBe(
		"https://bvh.example.test/login?error=callback",
	);
	expect(await response.text()).not.toContain("private provider detail");
});
test("callback sin origen seguro falla cerrado", async () => {
	vi.stubEnv("NEXT_PUBLIC_SITE_URL", "http://public-insecure.test");
	const response = await GET(
		new Request("http://internal/auth/callback?code=synthetic"),
	);
	expect(response.status).toBe(503);
	expect(exchange).not.toHaveBeenCalled();
});
