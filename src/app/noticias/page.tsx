import type { Metadata } from "next";
import { ArticleIndex } from "@/components/bvh/ArticleIndex";
import { PageHero } from "@/components/bvh/PageHero";
import { SiteFooter } from "@/components/bvh/SiteFooter";
import { SiteHeader } from "@/components/bvh/SiteHeader";
import { listPublishedArticles } from "@/modules/content/repository.server";

export const metadata: Metadata = {
	title: "Noticias | BVH",
	description:
		"Actualidad verificada de la Bolsa de Valores de La Habana: boletín diario sobre empresas, mercado y ecosistema emprendedor cubano.",
	alternates: { canonical: "/noticias" },
	openGraph: {
		title: "Noticias BVH",
		description:
			"Actualidad verificada de la Bolsa de Valores de La Habana: boletín diario sobre empresas, mercado y ecosistema emprendedor cubano.",
		url: "/noticias",
		type: "website",
	},
};

export const dynamic = "force-dynamic";

export default async function NoticiasPage() {
	const articles = await listPublishedArticles("noticia");
	const categories = [...new Set(articles.map((article) => article.cat))];

	return (
		<div className="min-h-screen bg-background text-foreground">
			<SiteHeader />
			<main id="contenido">
			<PageHero
				eyebrow="Boletín diario · Actualidad verificada"
				title={
					<>
						Noticias <span className="italic text-primary">BVH</span>
					</>
				}
				description="Análisis económico, avances regulatorios, movimientos de mercado y oportunidades para el empresariado cubano. Un correo al día, curado por nuestro equipo editorial."
			/>
			<ArticleIndex
				articles={articles}
				categories={categories}
				accentLabel="Noticias"
				basePath="/noticias"
				newsletter={{
					lista: "noticias",
					title: "Suscríbete al boletín diario",
					description:
						"Recibe cada mañana el resumen ejecutivo de lo que importa en la economía cubana. Sin spam. Un correo al día. Cancela cuando quieras.",
					placeholder: "tu@correo.cu",
					cta: "Suscribirme al boletín diario",
					hint: "Un correo al día · sin spam · puedes darte de baja cuando quieras.",
				}}
			/>
			</main>
			<SiteFooter />
		</div>
	);
}
