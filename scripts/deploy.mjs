import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

/**
 * Despliega uno de los dos destinos del proyecto.
 *
 *   node scripts/deploy.mjs sitio   → bolsadelahabana.com      (MVP editorial)
 *   node scripts/deploy.mjs app     → app.bolsadelahabana.com  (sitio completo)
 *
 * Lo que venga después del destino se le pasa a wrangler. `--dry-run` compila y
 * empaqueta sin publicar, que es la forma de comprobar el camino entero antes
 * de tocar un dominio vivo.
 *
 * Son dos builds distintos y no se pueden compartir: `NEXT_PUBLIC_MVP_EDITORIAL`
 * y `NEXT_PUBLIC_SITE_URL` se incrustan al compilar, así que el mismo artefacto
 * no puede servir los dos dominios. Por eso cada destino compila lo suyo.
 */

const TARGETS = {
	sitio: {
		worker: "bvh",
		domain: "https://bolsadelahabana.com",
		editorial: "1",
		// Sin --env: OpenNext descarta el entorno vacío por diseño, así que el
		// nivel superior de wrangler.jsonc (worker `bvh`) es el destino por
		// defecto. Wrangler avisa de que no se nombró entorno; es esperado.
		deployArgs: [],
		describe: "MVP editorial: portada, noticias, blog y panel",
	},
	app: {
		worker: "bvh-app",
		domain: "https://app.bolsadelahabana.com",
		editorial: "0",
		deployArgs: ["--env", "app"],
		describe: "sitio completo: índices, mercados, cotizar, instituto y formularios",
	},
};

const name = process.argv[2];
const passthrough = process.argv.slice(3);
const target = TARGETS[name];
if (!target) {
	console.error(
		`Destino desconocido: ${name ?? "(ninguno)"}. Usa "sitio" o "app".`,
	);
	process.exit(1);
}

// El mismo guardarraíl de siempre: production es la rama que se publica.
const branch = execFileSync("git", ["branch", "--show-current"], {
	encoding: "utf8",
}).trim();
if (branch !== "production") {
	console.error(`⛔ Debes estar en production para desplegar (estás en ${branch}).`);
	process.exit(1);
}

/**
 * Next carga `.env.production.local` durante el build. Si le falta algo, el
 * fallo no aparece al compilar sino en la primera visita, que es el peor sitio
 * donde enterarse: se comprueba antes de tocar nada.
 */
const envFile = ".env.production.local";
if (!existsSync(envFile)) {
	console.error(`⛔ Falta ${envFile}: el build no sabría a qué Supabase apuntar.`);
	process.exit(1);
}
const declared = new Set(
	readFileSync(envFile, "utf8")
		.split("\n")
		.map((line) => line.split("=")[0].trim())
		.filter(Boolean),
);
const required = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"];
// El sitio completo además persiste formularios, y eso pasa por la clave de
// servicio. El MVP editorial no tiene formularios y no la necesita.
if (name === "app") required.push("SUPABASE_SERVICE_ROLE_KEY");
const missing = required.filter(
	(key) => !declared.has(key) && !process.env[key],
);
if (missing.length > 0) {
	console.error(`⛔ Faltan en ${envFile}: ${missing.join(", ")}`);
	process.exit(1);
}

const env = {
	...process.env,
	NEXT_PUBLIC_MVP_EDITORIAL: target.editorial,
	NEXT_PUBLIC_SITE_URL: target.domain,
};

console.log(`\n▸ ${target.worker} → ${target.domain}`);
console.log(`  ${target.describe}`);
console.log(`  NEXT_PUBLIC_MVP_EDITORIAL=${target.editorial}\n`);

if (passthrough.length > 0) {
	console.log(`  argumentos para wrangler: ${passthrough.join(" ")}\n`);
}

for (const args of [
	["build"],
	["deploy", ...target.deployArgs, ...passthrough],
]) {
	const result = spawnSync("pnpm", ["exec", "opennextjs-cloudflare", ...args], {
		stdio: "inherit",
		env,
	});
	if (result.error) throw result.error;
	if (result.status !== 0) process.exit(result.status ?? 1);
}
