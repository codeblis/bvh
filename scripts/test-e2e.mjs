import { execFileSync, spawnSync } from "node:child_process";

const status = JSON.parse(
	execFileSync("supabase", ["status", "-o", "json"], { encoding: "utf8" }),
);
if (!status.API_URL || new URL(status.API_URL).hostname !== "127.0.0.1") {
	throw new Error(
		"Start the disposable local Supabase API before running E2E.",
	);
}

const result = spawnSync(
	"pnpm",
	["exec", "playwright", "test", ...process.argv.slice(2)],
	{
		stdio: "inherit",
		env: {
			...process.env,
			E2E_SUPABASE_URL: status.API_URL,
			E2E_SUPABASE_ANON_KEY: status.ANON_KEY,
			E2E_SUPABASE_SERVICE_ROLE_KEY: status.SERVICE_ROLE_KEY,
		},
	},
);
if (result.error) throw result.error;
process.exit(result.status ?? 1);
