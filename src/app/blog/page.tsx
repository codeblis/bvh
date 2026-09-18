import type { Metadata } from "next";
import { ArticleIndex } from "@/components/bvh/ArticleIndex";
import { PageHero } from "@/components/bvh/PageHero";
import { SiteFooter } from "@/components/bvh/SiteFooter";
import { SiteHeader } from "@/components/bvh/SiteHeader";
import { listPublishedArticles } from "@/modules/content/repository.server";

export const metadata: Metadata = {
	title: "Blog | BVH",
	description:
		"Ensayos y análisis semanales de la Bolsa de Valores de La Habana sobre economía, empresa y educación financiera en Cuba.",
	alternates: { canonical: "/blog" },
	openGraph: {
		title: "Blog BVH",
		description:
			"Ensayos y análisis semanales de la Bolsa de Valores de La Habana sobre economía, empresa y educación financiera en Cuba.",
		url: "/blog",
		type: "website",
	},
};

export const dynamic = "force-dynamic";

export default async function BlogPage() {
	const articles = await listPublishedArticles("blog");
	const categories = [...new Set(articles.map((article) => article.cat))];

	return (
		<div className="min-h-screen bg-background text-foreground">
			<SiteHeader />
			<main id="contenido">
			<PageHero
				eyebrow="Ensayo semanal · Análisis profundo"
				title={
					<>
						Blog <span className="italic text-primary">BVH</span>
					</>
				}
				description="Ensayos de fondo sobre finanzas, economía, historia y estrategia. Escritos por el equipo BVH y colaboradores invitados. Para leer con calma, pensar y actuar."
			/>
			<ArticleIndex
				articles={articles}
				categories={categories}
				accentLabel="Blog"
				basePath="/blog"
				newsletter={{
					lista: "blog",
					title: "Suscríbete al boletín semanal",
					description:
						"Un ensayo cada domingo en tu bandeja. Profundo, sin ruido, con perspectiva de largo plazo.",
					placeholder: "tu@correo.cu",
					cta: "Suscribirme al boletín semanal",
					hint: "Un correo a la semana · sin spam · puedes darte de baja cuando quieras.",
				}}
			/>
			</main>
			<SiteFooter />
		</div>
	);
}
