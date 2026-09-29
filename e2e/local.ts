import { expect, type Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/supabase";

function required(name: string) {
	const value = process.env[name];
	if (!value) throw new Error(`Missing local test setting: ${name}`);
	return value;
}

const url = required("E2E_SUPABASE_URL");
if (new URL(url).hostname !== "127.0.0.1") {
	throw new Error("Test fixtures require disposable Supabase on 127.0.0.1.");
}
export const testPassword = "local-e2e-password";
const auth = { persistSession: false, autoRefreshToken: false };
export const service = createClient<Database>(
	url,
	required("E2E_SUPABASE_SERVICE_ROLE_KEY"),
	{ auth },
);

export async function createTestUser(email: string, admin = false) {
	const { data, error } = await service.auth.admin.createUser({
		email,
		password: testPassword,
		email_confirm: true,
		user_metadata: { nombre: "Usuario de prueba", tipo: "individual" },
	});
	if (error || !data.user) throw error ?? new Error("Missing fixture user");
	if (admin) {
		const promoted = await service
			.from("profiles")
			.update({ role: "admin" })
			.eq("id", data.user.id);
		if (promoted.error) throw promoted.error;
	}
	return data.user;
}

export async function deleteTestUser(id: string) {
	const profile = await service.from("profiles").delete().eq("id", id);
	if (profile.error) throw profile.error;
	const removed = await service.auth.admin.deleteUser(id);
	if (removed.error) throw removed.error;
}

export function createPublicClient() {
	return createClient<Database>(url, required("E2E_SUPABASE_ANON_KEY"), {
		auth,
	});
}

export async function signInApi(email: string) {
	const client = createPublicClient();
	const result = await client.auth.signInWithPassword({
		email,
		password: testPassword,
	});
	if (result.error) throw result.error;
	return client;
}

export async function signInPage(
	page: Page,
	email: string,
	destination: string,
) {
	await page.goto(`/login?callbackUrl=${encodeURIComponent(destination)}`);
	await page.getByLabel("Email").fill(email);
	await page.getByLabel("Contraseña").fill(testPassword);
	await page.getByRole("button", { name: "Iniciar sesión" }).click();
	await expect(page).toHaveURL((current) => current.pathname === destination);
}

const emailStubUrl = `http://127.0.0.1:${process.env.E2E_EMAIL_STUB_PORT ?? "3101"}`;

export type EmailStubMode = "reject" | "accept" | "drop";
export type EmailStubAttempt = {
	idempotencyKey: string | null;
	subject: string | null;
	to: string | string[] | null;
};

async function stub(init?: RequestInit) {
	const response = await fetch(`${emailStubUrl}/__stub`, init);
	if (!response.ok) throw new Error(`Email stub error: ${response.status}`);
	return (await response.json()) as {
		mode: EmailStubMode;
		attempts: EmailStubAttempt[];
	};
}

export async function setEmailStub(mode: EmailStubMode, reset = false) {
	return stub({
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ mode, reset }),
	});
}

export async function emailStubAttempts() {
	return (await stub()).attempts;
}
