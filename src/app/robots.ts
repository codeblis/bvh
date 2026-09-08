import type { MetadataRoute } from "next";

const siteUrl = (
	process.env.NEXT_PUBLIC_SITE_URL ?? "https://bolsadelahabana.com"
).replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
	return {
		rules: {
			userAgent: "*",
			allow: "/",
			// Panel, área privada, callbacks y enlaces con token: nada que indexar.
			disallow: [
				"/admin",
				"/cuenta",
				"/auth",
				"/newsletter",
				"/actualizar-password",
			],
		},
		sitemap: `${siteUrl}/sitemap.xml`,
		host: siteUrl,
	};
}
