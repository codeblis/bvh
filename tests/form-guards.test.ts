import { afterEach, beforeEach, expect, test, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { serviceClient, deliverEmail } = vi.hoisted(() => ({
	serviceClient: vi.fn(),
	deliverEmail: vi.fn(),
}));
vi.mock("@/lib/supabase/service", () => ({
	createServiceClient: serviceClient,
}));
vi.mock("@/modules/forms/email.server", () => ({ deliverEmail }));

const original = { ...process.env };

type RpcCall = { name: string; args: Record<string, unknown> };

function fakeSupabase(options: { withinLimit: boolean; calls: RpcCall[] }) {
	return {
		rpc(name: string, args: Record<string, unknown>) {
			options.calls.push({ name, args });
			if (name === "check_form_rate_limit") {
				return Promise.resolve({ data: options.withinLimit, error: null });
			}
			if (name === "submit_contact_message") {
				return {
					single: () =>
						Promise.resolve({
							data: {
								submission_id: "11111111-1111-1111-1111-111111111111",
								notification_token: "22222222-2222-2222-2222-222222222222",
							},
							error: null,
						}),
				};
			}
			return Promise.resolve({ data: null, error: null });
		},
	};
}

function contactRequest(body: Record<string, unknown>) {
	return new Request("https://bvh.test/api/contacto", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"CF-Connecting-IP": "203.0.113.7",
		},
		body: JSON.stringify(body),
	});
}

const validBody = {
	nombre: "Persona de prueba",
	email: "persona@example.test",
	asunto: "Otro",
	mensaje: "Mensaje válido para comprobar las barreras de la ruta.",
};

beforeEach(() => {
	vi.resetAllMocks();
	deliverEmail.mockResolvedValue({ success: true, providerId: "sintetico" });
	// Estas barreras son las del sitio completo: el MVP editorial no publica
	// formularios y sus rutas responden 404 (se comprueba en scope.test.ts).
	process.env.NEXT_PUBLIC_MVP_EDITORIAL = "0";
	process.env.TURNSTILE_SECRET_KEY = "";
	process.env.TURNSTILE_VERIFY_URL = "https://verificador.example.test/verify";
});

afterEach(() => {
	process.env = { ...original };
});

test("quien excede el límite recibe 429 y su solicitud no llega a guardarse", async () => {
	const calls: RpcCall[] = [];
	serviceClient.mockReturnValue(fakeSupabase({ withinLimit: false, calls }));
	const { POST } = await import("../src/app/api/contacto/route");

	const response = await POST(contactRequest(validBody));
	expect(response.status).toBe(429);
	expect(calls.map((call) => call.name)).toEqual(["check_form_rate_limit"]);
	expect(deliverEmail).not.toHaveBeenCalled();
});

test("el cliente se identifica por un hash, nunca por su dirección", async () => {
	const calls: RpcCall[] = [];
	serviceClient.mockReturnValue(fakeSupabase({ withinLimit: true, calls }));
	const { POST } = await import("../src/app/api/contacto/route");

	await POST(contactRequest(validBody));
	const bucket = String(calls[0].args.p_bucket);
	expect(bucket.startsWith("contacto:")).toBe(true);
	expect(bucket).not.toContain("203.0.113.7");
	expect(bucket).toMatch(/^contacto:[0-9a-f]{32}$/);
});

test("con Turnstile activo, un envío sin token se rechaza antes de guardar", async () => {
	process.env.TURNSTILE_SECRET_KEY = "clave-sintetica";
	const calls: RpcCall[] = [];
	serviceClient.mockReturnValue(fakeSupabase({ withinLimit: true, calls }));
	const { POST } = await import("../src/app/api/contacto/route");

	const response = await POST(contactRequest(validBody));
	expect(response.status).toBe(403);
	expect(calls.map((call) => call.name)).toEqual(["check_form_rate_limit"]);
	expect(deliverEmail).not.toHaveBeenCalled();
});

test("con Turnstile activo y el verificador caído, el envío tampoco pasa", async () => {
	process.env.TURNSTILE_SECRET_KEY = "clave-sintetica";
	vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("corte sintético"));
	const calls: RpcCall[] = [];
	serviceClient.mockReturnValue(fakeSupabase({ withinLimit: true, calls }));
	const { POST } = await import("../src/app/api/contacto/route");

	const response = await POST(
		contactRequest({ ...validBody, turnstileToken: "token" }),
	);
	expect(response.status).toBe(403);
	expect(deliverEmail).not.toHaveBeenCalled();
});

test("con Turnstile activo y token válido, el envío sigue su curso", async () => {
	process.env.TURNSTILE_SECRET_KEY = "clave-sintetica";
	vi.spyOn(globalThis, "fetch").mockResolvedValue({
		ok: true,
		json: async () => ({ success: true }),
	} as Response);
	const calls: RpcCall[] = [];
	serviceClient.mockReturnValue(fakeSupabase({ withinLimit: true, calls }));
	const { POST } = await import("../src/app/api/contacto/route");

	const response = await POST(
		contactRequest({ ...validBody, turnstileToken: "token-valido" }),
	);
	expect(response.status).toBe(200);
	expect(calls.map((call) => call.name)).toContain("submit_contact_message");
	expect(deliverEmail).toHaveBeenCalledTimes(1);
});

test("sin Turnstile configurado el formulario funciona como hasta ahora", async () => {
	const calls: RpcCall[] = [];
	serviceClient.mockReturnValue(fakeSupabase({ withinLimit: true, calls }));
	const { POST } = await import("../src/app/api/contacto/route");

	const response = await POST(contactRequest(validBody));
	expect(response.status).toBe(200);
	expect(await response.json()).toMatchObject({ ok: true });
});
