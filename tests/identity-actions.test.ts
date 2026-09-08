import { beforeEach, expect, test, vi } from "vitest";

const { auth, createClient } = vi.hoisted(() => ({
	auth: {
		signUp: vi.fn(),
		resetPasswordForEmail: vi.fn(),
		getUser: vi.fn(),
		updateUser: vi.fn(),
		signOut: vi.fn(),
	},
	createClient: vi.fn(),
}));
vi.mock("@/lib/supabase/server", () => ({ createClient }));

import {
	registerAccount,
	requestPasswordRecovery,
	updatePassword,
} from "../src/modules/identity/actions";

const valid = {
	nombre: "Persona de prueba",
	email: "persona@example.test",
	password: "test-password",
	confirmPassword: "test-password",
	tipo: "individual",
	aceptaTerminos: true,
	newsletter: false,
};
beforeEach(() => {
	vi.resetAllMocks();
	vi.stubEnv("NEXT_PUBLIC_SITE_URL", "http://127.0.0.1:3100");
	createClient.mockResolvedValue({ auth });
});

test("registro valida datos en servidor antes de contactar Auth", async () => {
	for (const input of [
		null,
		{ ...valid, nombre: "" },
		{ ...valid, email: "no-email" },
		{ ...valid, password: "123", confirmPassword: "123" },
		{ ...valid, aceptaTerminos: false },
		{ ...valid, tipo: "admin" },
		{ ...valid, confirmPassword: "otro-password" },
	]) {
		expect(await registerAccount(input)).toHaveProperty("error");
	}
	expect(createClient).not.toHaveBeenCalled();
});

test("registro usa origen configurado e ignora privilegios manipulados", async () => {
	auth.signUp.mockResolvedValue({ error: null });
	expect(
		await registerAccount({
			...valid,
			role: "admin",
			emailRedirectTo: "https://attacker.test",
		}),
	).toEqual({ accepted: true });
	expect(auth.signUp).toHaveBeenCalledWith({
		email: valid.email,
		password: valid.password,
		options: {
			emailRedirectTo: "http://127.0.0.1:3100/auth/callback?next=%2Fcuenta",
			data: { nombre: valid.nombre, tipo: valid.tipo, newsletter: false },
		},
	});
});

test("registro no distingue cuenta duplicada ni expone errores internos", async () => {
	auth.signUp.mockResolvedValue({
		error: { code: "user_already_exists", message: "private provider detail" },
	});
	expect(await registerAccount(valid)).toEqual({ accepted: true });
	auth.signUp.mockRejectedValue(new Error("private provider detail"));
	expect(JSON.stringify(await registerAccount(valid))).not.toContain(
		"private provider detail",
	);
});

test("recuperación no distingue aceptación, email desconocido ni fallo del proveedor", async () => {
	const warning = vi.spyOn(console, "warn").mockImplementation(() => {});
	auth.resetPasswordForEmail.mockResolvedValue({ error: null });
	const accepted = await requestPasswordRecovery(valid.email);
	auth.resetPasswordForEmail.mockResolvedValue({
		error: { message: "unknown user" },
	});
	expect(await requestPasswordRecovery("unknown@example.test")).toEqual(
		accepted,
	);
	auth.resetPasswordForEmail.mockRejectedValue(new Error("transport failure"));
	expect(await requestPasswordRecovery(valid.email)).toEqual(accepted);
	expect(await requestPasswordRecovery("invalid")).toHaveProperty("error");
	warning.mockRestore();
});

test("actualización valida sesión y contraseña sin mutación anónima", async () => {
	expect(
		await updatePassword({ password: "short", confirmation: "short" }),
	).toHaveProperty("error");
	auth.getUser.mockResolvedValue({ data: { user: null }, error: null });
	expect(
		await updatePassword({
			password: valid.password,
			confirmation: valid.password,
		}),
	).toHaveProperty("error");
	expect(auth.updateUser).not.toHaveBeenCalled();
});

test("actualización correcta cierra sesión local antes de pedir nuevo login", async () => {
	auth.getUser.mockResolvedValue({
		data: { user: { id: "synthetic" } },
		error: null,
	});
	auth.updateUser.mockResolvedValue({ error: null });
	auth.signOut.mockResolvedValue({ error: null });
	expect(
		await updatePassword({
			password: valid.password,
			confirmation: valid.password,
		}),
	).toEqual({ updated: true });
	expect(auth.signOut).toHaveBeenCalledWith({ scope: "local" });
});
