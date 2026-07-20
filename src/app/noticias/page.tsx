"use client";

import { PageHero } from "@/components/bvh/PageHero";
import { SiteHeader } from "@/components/bvh/SiteHeader";
import { SiteFooter } from "@/components/bvh/SiteFooter";
import { ArticleIndex } from "@/components/bvh/ArticleIndex";
import { NEWS, CATEGORIES } from "@/data/noticias";

export default function NoticiasPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <PageHero
        eyebrow="Boletín diario · Actualidad verificada"
        title={<>Noticias <span className="italic text-primary">BVH</span></>}
        description="Análisis económico, avances regulatorios, movimientos de mercado y oportunidades para el empresariado cubano. Un correo al día, curado por nuestro equipo editorial."
      />
      <ArticleIndex
        articles={NEWS}
        categories={CATEGORIES}
        accentLabel="Noticias"
        basePath="/noticias"
        newsletter={{
          title: "Suscríbete al boletín diario",
          description: "Recibe cada mañana el resumen ejecutivo de lo que importa en la economía cubana. Sin spam. Un correo al día. Cancela cuando quieras.",
          placeholder: "tu@correo.cu",
          cta: "Suscribirme al boletín diario",
          hint: "Un correo al día · sin spam · puedes darte de baja cuando quieras.",
        }}
      />
      <SiteFooter />
    </div>
  );
}