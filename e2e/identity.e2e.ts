import { randomUUID } from "node:crypto";
import { expect, type Page, test } from "@playwright/test";
import {
	createPublicClient,
	createTestUser,
	deleteTestUser,
	service,
	testPassword,
} from "./local";

const mailUrl = "http://127.0.0.1:54324";
const received =
	"Solicitud recibida. Revisa tu correo si se requiere confirmación. Si ya tienes cuenta, inicia sesión.";

async function findMail(email: string, subject: string) {
	const response = await fetch(
		`${mailUrl}/api/v1/search?query=${encodeURIComponent(`to:${email}`)}`,
	);
	if (!response.ok) throw new Error("Local mail search unavailable");
	const data = (await response.json()) as {
		messages: { ID: string; Subject: string }[];
	};
	return data.messages.find((message) => message.Subject.includes(subject))?.ID;
}

async function followMail(page: Page, email: string, subject: string) {
	let id: string | undefined;
	await expect
		.poll(
			async () => {
				id = await findMail(email, subject);
				return Boolean(id);
			},
			{ timeout: 15_000 },
		)
		.toBe(true);
	const response = await fetch(`${mailUrl}/api/v1/message/${id}`);
	if (!response.ok) throw new Error("Local mail unavailable");
	const message = (await response.json()) as { HTML: string };
	const links = [...message.HTML.matchAll(/href="([^"]+)"/g)].map((match) =>
		match[1].replaceAll("&amp;", "&"),
	);
	const link = links.find((value) => {
		const url = new URL(value);
		return (
			url.origin === process.env.E2E_SUPABASE_URL &&
			url.pathname === "/auth/v1/verify"
		);
	});
	if (!link)
		throw new Error("No local auth verification link in captured mail");
	await page.goto(link);
}

async function clearMail(email: string) {
	const response = await fetch(
		`${mailUrl}/api/v1/search?query=${encodeURIComponent(`to:${email}`)}`,
	);
	if (!response.ok) return;
	const data = (await response.json()) as { messages: { ID: string }[] };
	if (data.messages.length) {
		const removed = await fetch(`${mailUrl}/api/v1/messages`, {
			method: "DELETE",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ IDs: data.messages.map((message) => message.ID) }),
		});
		expect.soft(removed.ok).toBe(true);
	}
}

async function register(page: Page, email: string, password = testPassword) {
	await page.goto("/registro");
	await page.getByLabel("Nombre completo").fill("Persona E2E");
	await page.getByLabel("Email", { exact: false }).fill(email);
	await page.getByLabel("Contraseña *", { exact: true }).fill(password);
	await page.getByLabel("Confirmar contraseña").fill(password);
	await page.getByLabel("Acepto los").check();
	await page.getByRole("button", { name: "Crear cuenta" }).click();
}

async function login(
	page: Page,
	email: string,
	password: string,
	callback = "/cuenta",
) {
	await page.goto(`/login?callbackUrl=${encodeURIComponent(callback)}`);
	await page.getByLabel("Email", { exact: true }).fill(email);
	await page.getByLabel("Contraseña", { exact: true }).fill(password);
	await page.getByRole("button", { name: "Iniciar sesión" }).click();
}

test("identidad: registro validado, confirmación real, recuperación y logout", async ({
	page,
}) => {
	test.setTimeout(120_000);
	const email = `identity-${randomUUID()}@example.test`;
	const newPassword = "local-e2e-new-password";
	try {
		await register(page, email, "short");
		await expect(
			page.getByRole("alert").filter({ hasText: "al menos 8" }),
		).toBeVisible();
		await register(page, email);
		await expect(page.getByRole("status")).toHaveText(received);
		await page.goto("/cuenta");
		await expect(page).toHaveURL((url) => url.pathname === "/login");
		const profile = await service
			.from("profiles")
			.select("id, role")
			.eq("email", email)
			.single();
		expect(profile.error).toBeNull();
		expect(profile.data?.role).toBe("usuario");
		if (!profile.data) throw new Error("Missing signup profile");
		const pending = await service.auth.admin.getUserById(profile.data.id);
		expect(pending.data.user?.email_confirmed_at).toBeFalsy();
		await followMail(page, email, "Confirm");
		await expect(page).toHaveURL((url) => url.pathname === "/cuenta");
		await expect(
			page.getByRole("heading", { name: "Tu cuenta BVH" }),
		).toBeVisible();
		await page.getByRole("button", { name: "Cerrar sesión" }).click();
		await expect(page).toHaveURL((url) => url.pathname === "/");
		await page.goto("/cuenta");
		await expect(page).toHaveURL((url) => url.pathname === "/login");

		await page.goto("/recuperar-password");
		await page.getByLabel("Correo electrónico").fill(email);
		await page.getByRole("button", { name: "Enviar instrucciones" }).click();
		await expect(page.getByRole("status")).toContainText(
			"Si existe una cuenta",
		);
		const recoveryMessage = await page.getByRole("status").textContent();
		await followMail(page, email, "Reset");
		await expect(page).toHaveURL(
			(url) => url.pathname === "/actualizar-password",
		);
		await page
			.getByLabel("Nueva contraseña", { exact: true })
			.fill(newPassword);
		await page.getByLabel("Confirmar contraseña").fill(newPassword);
		await page.getByRole("button", { name: "Guardar contraseña" }).click();
		await expect(page).toHaveURL(
			(url) =>
				url.pathname === "/login" &&
				url.searchParams.get("passwordUpdated") === "true",
		);
		await page.goto("/cuenta");
		await expect(page).toHaveURL((url) => url.pathname === "/login");
		await login(page, email, testPassword);
		await expect(
			page.locator('[role="alert"]:not(#__next-route-announcer__)'),
		).toContainText("No pudimos iniciar sesión");
		await login(page, email, newPassword);
		await expect(page).toHaveURL((url) => url.pathname === "/cuenta");
		await page.getByRole("button", { name: "Cerrar sesión" }).click();
		await expect(page).toHaveURL((url) => url.pathname === "/");
		await page.goto("/recuperar-password");
		await page.getByLabel("Correo electrónico").fill(`unknown-${email}`);
		await page.getByRole("button", { name: "Enviar instrucciones" }).click();
		await expect(page.getByRole("status")).toHaveText(recoveryMessage ?? "");
		await register(page, email);
		await expect(page.getByRole("status")).toHaveText(received);
	} finally {
		const profile = await service
			.from("profiles")
			.select("id")
			.eq("email", email)
			.maybeSingle();
		if (profile.data) await deleteTestUser(profile.data.id);
		await clearMail(email);
	}
});

test("identidad: callbacks hostiles, acceso privado y errores no enumeradores", async ({
	page,
}) => {
	const email = `redirect-${randomUUID()}@example.test`;
	const user = await createTestUser(email);
	try {
		await page.goto("/admin");
		await expect(page).toHaveURL((url) => url.pathname === "/login");
		await page.goto("/actualizar-password");
		await page
			.getByLabel("Nueva contraseña", { exact: true })
			.fill("valid-local-password");
		await page.getByLabel("Confirmar contraseña").fill("valid-local-password");
		await page.getByRole("button", { name: "Guardar contraseña" }).click();
		await expect(
			page.locator('[role="alert"]:not(#__next-route-announcer__)'),
		).toContainText("El enlace no es válido");
		await login(page, email, "wrong-password");
		await expect(
			page.locator('[role="alert"]:not(#__next-route-announcer__)'),
		).toContainText("No pudimos iniciar sesión");
		const message = await page
			.locator('[role="alert"]:not(#__next-route-announcer__)')
			.textContent();
		await login(page, `unknown-${email}`, "wrong-password");
		await expect(
			page.locator('[role="alert"]:not(#__next-route-announcer__)'),
		).toHaveText(message ?? "");
		for (const callback of [
			"https://example.test",
			"//example.test",
			"/admin/%2e%2e/otra-ruta",
			"/admin/%255cexample.test",
		]) {
			await login(page, email, testPassword, callback);
			await expect(page).toHaveURL(
				(url) =>
					url.origin === "http://127.0.0.1:3100" && url.pathname === "/cuenta",
			);
			await page.goto("/admin");
			await expect(page).toHaveURL(
				(url) =>
					url.pathname === "/cuenta" &&
					url.searchParams.get("error") === "forbidden",
			);
			await page.getByRole("button", { name: "Cerrar sesión" }).click();
			await expect(page).toHaveURL((url) => url.pathname === "/");
		}
		await page.goto(
			"/auth/callback?code=invalid-code&next=https%3A%2F%2Fexample.test",
		);
		await expect(page).toHaveURL(
			(url) =>
				url.pathname === "/login" &&
				url.searchParams.get("error") === "callback",
		);
	} finally {
		await deleteTestUser(user.id);
	}
});

test("identidad: role=admin en Auth y perfil nunca eleva privilegios", async () => {
	const email = `role-${randomUUID()}@example.test`;
	const client = createPublicClient();
	let id: string | undefined;
	try {
		const signup = await client.auth.signUp({
			email,
			password: testPassword,
			options: {
				data: { role: "admin", nombre: "Role E2E", tipo: "individual" },
			},
		});
		expect(signup.error).toBeNull();
		id = signup.data.user?.id;
		if (!id) throw new Error("Missing auth fixture");
		const confirmed = await service.auth.admin.updateUserById(id, {
			email_confirm: true,
		});
		expect(confirmed.error).toBeNull();
		const signed = await client.auth.signInWithPassword({
			email,
			password: testPassword,
		});
		expect(signed.error).toBeNull();
		const metadata = await client.auth.updateUser({ data: { role: "admin" } });
		expect(metadata.error).toBeNull();
		const promotion = await client
			.from("profiles")
			.update({ role: "admin" })
			.eq("id", id);
		expect(promotion.error?.code).toBe("42501");
		const profile = await client
			.from("profiles")
			.select("role")
			.eq("id", id)
			.single();
		expect(profile.data?.role).toBe("usuario");
	} finally {
		if (id) await deleteTestUser(id);
		await clearMail(email);
	}
});
