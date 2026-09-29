import { defineConfig } from "@playwright/test";

const baseURL = process.env.E2E_BASE_URL ?? "http://127.0.0.1:3100";
const supabaseUrl = process.env.E2E_SUPABASE_URL;
const anonKey = process.env.E2E_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.E2E_SUPABASE_SERVICE_ROLE_KEY;
const emailStubPort = process.env.E2E_EMAIL_STUB_PORT ?? "3101";
// Los recorridos de esta carpeta cubren el sitio completo: formularios, cursos
// y campañas. Se construye con el alcance abierto salvo que la tanda pida el
// MVP editorial, que tiene su propia configuración y su propio recorrido.
const editorialScope = process.env.E2E_MVP_EDITORIAL ?? "0";
const emailStubUrl = `http://127.0.0.1:${emailStubPort}`;

if (!supabaseUrl || !anonKey || !serviceRoleKey) {
	throw new Error(
		"E2E requires local E2E_SUPABASE_URL, E2E_SUPABASE_ANON_KEY and E2E_SUPABASE_SERVICE_ROLE_KEY.",
	);
}

for (const url of [baseURL, supabaseUrl, emailStubUrl]) {
	if (new URL(url).hostname !== "127.0.0.1") {
		throw new Error("E2E only supports disposable services on 127.0.0.1.");
	}
}

export default defineConfig({
	testDir: "./e2e",
	testMatch: "**/*.e2e.ts",
	fullyParallel: false,
	workers: 1,
	retries: 0,
	timeout: 90_000,
	reporter: "line",
	use: {
		baseURL,
		channel: "chrome",
		headless: true,
		trace: "retain-on-failure",
		screenshot: "only-on-failure",
	},
	webServer: [
		{
			command: `node e2e/resend-stub.mjs`,
			url: `${emailStubUrl}/__stub`,
			reuseExistingServer: false,
			timeout: 30_000,
			env: { RESEND_STUB_PORT: emailStubPort },
		},
		{
			command: "pnpm build && pnpm start --hostname 127.0.0.1 --port 3100",
			url: baseURL,
			reuseExistingServer: false,
			timeout: 180_000,
			env: {
				NEXT_PUBLIC_MVP_EDITORIAL: editorialScope,
				NEXT_PUBLIC_SITE_URL: baseURL,
				NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
				NEXT_PUBLIC_SUPABASE_ANON_KEY: anonKey,
				SUPABASE_SERVICE_ROLE_KEY: serviceRoleKey,
				RESEND_API_KEY: "re_local_stub_key",
				RESEND_BASE_URL: emailStubUrl,
				EMAIL_FROM: "BVH Local <no-reply@example.test>",
				EMAIL_TO: "operaciones@example.test",
			},
		},
	],
});
