"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHero } from "@/components/bvh/PageHero";
import { SiteHeader } from "@/components/bvh/SiteHeader";
import { SiteFooter } from "@/components/bvh/SiteFooter";
import { ArrowRight } from "lucide-react";

const POSTS = [
  {
    id: "1",
    slug: "reflexion-capital-cubano",
    fecha: "20 jul 2026",
    titulo: "Reflexión: ¿Qué significa 'capital cubano reencontrado'?",
    excerpt: "Más que una frase, es una declaración de intenciones. Recuperar la memoria financiera de la Habana de los 50 para construir el futuro.",
    autor: "Editorial BVH",
    tiempo: "6 min",
    tags: ["Opinión", "Historia", "Identidad"],
  },
  {
    id: "2",
    slug: "gobernanza-mipymes-practica",
    fecha: "13 jul 2026",
    titulo: "Gobernanza en MIPYMES: de la intuición al sistema",
    excerpt: "Muchas empresas familiares crecen hasta que la falta de estructura frena su escalabilidad. Claves para profesionalizar sin perder la esencia.",
    autor: "Dra. Ana Rodríguez",
    tiempo: "9 min",
    tags: ["Gobernanza", "MIPYMES", "Escalabilidad"],
  },
  {
    id: "3",
    slug: "diaspora-no-solo-remesas",
    fecha: "06 jul 2026",
    titulo: "La diáspora no envía solo remesas: envía capital, conocimiento y redes",
    excerpt: "Entrevista a tres emprendedores cubano-americanos que invierten en la isla. El Club de Inversión BVH como puente institucional.",
    autor: "Roberto García",
    tiempo: "11 min",
    tags: ["Diáspora", "Inversión", "Club BVH"],
  },
  {
    id: "4",
    slug: "valoracion-dcf-cuba",
    fecha: "29 jun 2026",
    titulo: "DCF en Cuba: ajustando la tasa de descuento por riesgo país",
    excerpt: "Técnica pura aplicada al contexto: WACC, prima de riesgo soberano, restricciones de convertibilidad y horizonte de inversión.",
    autor: "Dr. Carlos Méndez",
    tiempo: "14 min",
    tags: ["Valoración", "Técnica", "Instituto BVH"],
  },
  {
    id: "5",
    slug: "historia-bolsa-habana-1950",
    fecha: "22 jun 2026",
    titulo: "La Bolsa de La Habana 1950-1959: crónica de un mercado perdido",
    excerpt: "Empresas listadas, volúmenes, índices y el marco regulatorio. Lo que la historia nos enseña para no repetir errores.",
    autor: "Equipo Investigación BVH",
    tiempo: "15 min",
    tags: ["Historia", "Archivo", "Mercados"],
  },
  {
    id: "6",
    slug: "fintech-regulacion-cuba",
    fecha: "15 jun 2026",
    titulo: "Fintech en Cuba: el vacío regulatorio que frena la innovación",
    excerpt: "Pagos móviles, lending alternativo, tokenización de activos. Qué necesitan los reguladores para decir sí sin poner en riesgo la estabilidad.",
    autor: "Ing. Carlos Herrera",
    tiempo: "8 min",
    tags: ["Fintech", "Regulación", "Innovación"],
  },
];

export default function BlogPage() {
  const [page, setPage] = useState(1);
  const postsPorPagina = 4;

  const totalPaginas = Math.ceil(POSTS.length / postsPorPagina);
  const paginados = POSTS.slice((page - 1) * postsPorPagina, page * postsPorPagina);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <PageHero
        eyebrow="Ensayo semanal · Análisis profundo"
        title={<>Blog <span className="italic text-primary">BVH</span></>}
        description="Ensayos de fondo sobre finanzas, economía, historia y estrategia. Escritos por el equipo BVH y colaboradores invitados. Para leer con calma, pensar y actuar."
      />

      <section className="mx-auto max-w-3xl px-6 py-12 md:py-16">
        <div className="space-y-12">
          {paginados.map((p) => (
            <article key={p.id} className="group relative rounded-xl border border-border bg-background p-4 transition-colors hover:bg-card hover:border-primary/50 sm:p-6 md:p-8">
              <div className="flex items-center gap-2 flex-wrap mb-3">
                <span className="text-[10px] text-muted-foreground">{p.fecha}</span>
                <span className="text-[10px] text-muted-foreground">{p.tiempo}</span>
                <span className="text-[10px] text-muted-foreground">Por {p.autor}</span>
              </div>
              <h2 className="font-serif text-2xl leading-tight text-foreground group-hover:text-primary transition-colors mb-2">{p.titulo}</h2>
              <p className="text-[14px] leading-relaxed text-muted-foreground mb-4">{p.excerpt}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {p.tags.map((t) => (
                  <span key={t} className="rounded-full border border-border bg-secondary/60 px-2.5 py-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">{t}</span>
                ))}
              </div>
              <Link
                href={`/blog/${p.slug}`}
                className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-primary hover:underline"
              >
                Leer completo
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>

        {totalPaginas > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              type="button"
              className="rounded-md border border-border bg-background px-4 py-2 text-[12px] font-medium uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary"
            >
              Anterior
            </button>
            <span className="px-4 text-[13px] text-muted-foreground">Página {page} de {totalPaginas}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPaginas, p + 1))}
              disabled={page === totalPaginas}
              type="button"
              className="rounded-md border border-border bg-background px-4 py-2 text-[12px] font-medium uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary"
            >
              Siguiente
            </button>
          </div>
        )}

        <div className="mt-16 rounded-2xl border border-border bg-card/70 p-8 md:p-12 shadow-[var(--shadow-elegant)] backdrop-blur text-center">
          <h3 className="font-serif text-2xl leading-tight text-foreground md:text-3xl">
            Suscríbete al <span className="italic text-primary">boletín semanal</span>
          </h3>
          <p className="mt-4 max-w-xl mx-auto text-[14px] leading-relaxed text-muted-foreground">
            Un ensayo cada domingo en tu bandeja. Profundo, sin ruido, con perspectiva de largo plazo.
          </p>
          <form className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
            <input
              required
              type="email"
              placeholder="tu@correo.cu"
              className="flex-1 rounded-md border border-border bg-background/80 px-4 py-3 text-[13px] text-foreground focus:border-primary focus:outline-none"
            />
            <button type="submit" className="rounded-md bg-primary px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-primary-foreground shadow-[var(--shadow-gold)] transition hover:brightness-110">
              Suscribirme
            </button>
          </form>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}