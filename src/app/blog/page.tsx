"use client";

import { PageHero } from "@/components/bvh/PageHero";
import { SiteHeader } from "@/components/bvh/SiteHeader";
import { SiteFooter } from "@/components/bvh/SiteFooter";
import { ArticleIndex } from "@/components/bvh/ArticleIndex";
import { POSTS, CATEGORIES } from "@/data/blog";

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <PageHero
        eyebrow="Ensayo semanal · Análisis profundo"
        title={<>Blog <span className="italic text-primary">BVH</span></>}
        description="Ensayos de fondo sobre finanzas, economía, historia y estrategia. Escritos por el equipo BVH y colaboradores invitados. Para leer con calma, pensar y actuar."
      />
      <ArticleIndex
        articles={POSTS}
        categories={CATEGORIES}
        accentLabel="Blog"
        basePath="/blog"
        newsletter={{
          title: "Suscríbete al boletín semanal",
          description: "Un ensayo cada domingo en tu bandeja. Profundo, sin ruido, con perspectiva de largo plazo.",
          placeholder: "tu@correo.cu",
          cta: "Suscribirme al boletín semanal",
          hint: "Un correo a la semana · sin spam · puedes darte de baja cuando quieras.",
        }}
      />
      <SiteFooter />
    </div>
  );
}