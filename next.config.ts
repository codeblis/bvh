import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

/**
 * Un build de producción sin estas variables no falla: emite un sitio mudo.
 * Las páginas responden 500 porque el servidor no sabe a qué Supabase llamar, y
 * nadie puede entrar al panel porque el cliente del navegador se compila sin
 * URL ni clave. El despliegue parece correcto y el fallo solo aparece en la
 * primera visita.
 *
 * Pasó: el build de Cloudflare se dispara con un push y corre donde no existe
 * `.env.production.local`, que está en .gitignore y no viaja con el repo. Por
 * eso la comprobación vive aquí y no en un script de despliegue: aquí la cruza
 * cualquier build, venga de donde venga, incluido el de CI.
 *
 * Se mira `NODE_ENV` y no `NEXT_PHASE`: en Next 16 esa segunda llega vacía.
 */
if (process.env.NODE_ENV === "production") {
	const faltan = [
		"NEXT_PUBLIC_SUPABASE_URL",
		"NEXT_PUBLIC_SUPABASE_ANON_KEY",
	].filter((clave) => !process.env[clave]?.trim());

	if (faltan.length > 0) {
		throw new Error(
			`Faltan variables obligatorias en el build: ${faltan.join(", ")}.\n` +
				"Se incrustan al compilar, así que declararlas después no sirve.\n" +
				"En Cloudflare van en la configuración de build del Worker; en local, " +
				"en .env.production.local.",
		);
	}
}

const nextConfig: NextConfig = {
	serverExternalPackages: ["@supabase/supabase-js", "resend"],
	experimental: {
		serverActions: {
			bodySizeLimit: "6mb",
		},
	},
	images: {
		unoptimized: true, // Cloudflare Workers no soporta la optimización nativa de <Image>
	},
};

initOpenNextCloudflareForDev();

export default nextConfig;
