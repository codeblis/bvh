import { afterEach, beforeEach, expect, test, vi } from "vitest";
import {
	isTurnstileEnabled,
	verifyTurnstile,
} from "../src/modules/forms/turnstile.server";

vi.mock("server-only", () => ({}));

const original = { ...process.env };

beforeEach(() => {
	vi.restoreAllMocks();
	process.env.TURNSTILE_SECRET_KEY = "clave-sintetica";
	process.env.TURNSTILE_VERIFY_URL = "https://verificador.example.test/verify";
});

afterEach(() => {
	process.env = { ...original };
});

function respondWith(body: unknown, ok = true) {
	return vi.spyOn(globalThis, "fetch").mockResolvedValue({
		ok,
		json: async () => body,
	} as Response);
}

test("sin secreto configurado la verificación no se interpone", async () => {
	process.env.TURNSTILE_SECRET_KEY = "";
	const fetchSpy = respondWith({ success: false });
	expect(isTurnstileEnabled()).toBe(false);
	expect(await verifyTurnstile(undefined)).toEqual({ ok: true });
	expect(fetchSpy).not.toHaveBeenCalled();
});

test("con secreto configurado, un envío sin token se rechaza sin consultar", async () => {
	const fetchSpy = respondWith({ success: true });
	expect(isTurnstileEnabled()).toBe(true);
	expect(await verifyTurnstile(undefined)).toEqual({
		ok: false,
		reason: "missing",
	});
	expect(fetchSpy).not.toHaveBeenCalled();
});

test("un token aceptado por Cloudflare deja pasar", async () => {
	const fetchSpy = respondWith({ success: true });
	expect(await verifyTurnstile("token-valido")).toEqual({ ok: true });
	const [url, init] = fetchSpy.mock.calls[0];
	expect(url).toBe("https://verificador.example.test/verify");
	expect(String((init as RequestInit).body)).toContain("response=token-valido");
});

test("cada token se verifica por sí mismo, sin clave de idempotencia", () => {
	// Cloudflare devuelve el resultado cacheado de una `idempotency_key`:
	// reutilizar una por cliente convertiría un acierto en permiso permanente.
	const fetchSpy = respondWith({ success: true });
	return verifyTurnstile("token-valido").then(() => {
		const body = String((fetchSpy.mock.calls[0][1] as RequestInit).body);
		expect(body).not.toContain("idempotency_key");
	});
});

test("un token rechazado no pasa", async () => {
	respondWith({ success: false, "error-codes": ["invalid-input-response"] });
	expect(await verifyTurnstile("token-falso")).toEqual({
		ok: false,
		reason: "rejected",
	});
});

test("si el verificador responde con error HTTP, el envío no se acepta a ciegas", async () => {
	respondWith({}, false);
	expect(await verifyTurnstile("token")).toEqual({
		ok: false,
		reason: "unavailable",
	});
});

test("si el verificador no responde, el envío se rechaza en vez de abrir la puerta", async () => {
	vi.spyOn(globalThis, "fetch").mockRejectedValue(
		new Error("Corte sintético de red"),
	);
	expect(await verifyTurnstile("token")).toEqual({
		ok: false,
		reason: "unavailable",
	});
});
