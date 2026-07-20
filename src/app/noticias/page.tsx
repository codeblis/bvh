"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHero } from "@/components/bvh/PageHero";
import { SiteHeader } from "@/components/bvh/SiteHeader";
import { SiteFooter } from "@/components/bvh/SiteFooter";

const CATEGORIAS = ["Todas", "BVH", "Economía Cuba", "Internacional", "Educación", "Mercados", "Regulación"] as const;

const ARTICULOS = [
  {
    id: "1",
    slug: "bvh-lanza-indice-general",
    cat: "BVH",
    fecha: "15 jul 2026",
    titulo: "BVH lanza su Índice General: transparencia histórica para el mercado cubano",
    excerpt: "El BVH General nace con 14 empresas fundadoras y metodología abierta. Primera referencia de precios para el empresariado cubano en 60 años.",
    imagen: "/images/placeholder-1.svg",
    autor: "Equipo BVH",
    tiempo: "5 min",
  },
  {
    id: "2",
    slug: "mipymes-crecimiento-2026",
    cat: "Economía Cuba",
    fecha: "12 jul 2026",
    titulo: "MIPYMES crecen 34% en primer semestre: el motor silencioso de la economía",
    excerpt: "Datos del ONEI y estimaciones BVH confirman la expansión del sector privado no estatal. Sectores líderes: alimentos, tech y servicios.",
    imagen: "/images/placeholder-2.svg",
    autor: "Dra. María López",
    tiempo: "7 min",
  },
  {
    id: "3",
    slug: "diaspora-inversion-cuba",
    cat: "Internacional",
    fecha: "08 jul 2026",
    titulo: "La diáspora cubana mueve $3.2B anuales: ¿cómo canalizarlo hacia inversión productiva?",
    excerpt: "Análisis de remesas, ahorro e intenciones de inversión. El Club de Inversión BVH como vehículo estructurado.",
    imagen: "/images/placeholder-3.svg",
    autor: "Roberto García",
    tiempo: "8 min",
  },
  {
    id: "4",
    slug: "valoracion-empresas-cubanas",
    cat: "Educación",
    fecha: "03 jul 2026",
    titulo: "Cómo valorar una empresa cubana: guía práctica para MIPYMES",
    excerpt: "Métodos DCF adaptados, múltiplos de mercado y valoración por activos. Incluye plantilla Excel descargable para socios del Instituto.",
    imagen: "/images/placeholder-4.svg",
    autor: "Dr. Carlos Méndez",
    tiempo: "12 min",
  },
  {
    id: "5",
    slug: "hse-avance-tecnico",
    cat: "Mercados",
    fecha: "01 jul 2026",
    titulo: "HSE avanza en su motor de matching: pruebas de carga superan 10k ops/seg",
    excerpt: "La infraestructura tecnológica de Havana Stock Exchange completa hitos críticos. Integración con custodios y liquidadores en Q4.",
    imagen: "/images/placeholder-5.svg",
    autor: "Equipo Tech HSE",
    tiempo: "4 min",
  },
  {
    id: "6",
    slug: "nueva-ley-mercados-valores",
    cat: "Regulación",
    fecha: "28 jun 2026",
    titulo: "Proyecto de Ley de Mercados de Valores: claves para el empresariado",
    excerpt: "Análisis del borrador circulante: emisores, intermediarios, ofertas públicas, sanciones y protección al inversor minorista.",
    imagen: "/images/placeholder-6.svg",
    autor: "Lic. Ana Rodríguez",
    tiempo: "10 min",
  },
];

export default function NoticiasPage() {
  const [categoria, setCategoria] = useState<typeof CATEGORIAS[number]>("Todas");
  const [page, setPage] = useState(1);
  const articulosPorPagina = 6;

  const filtrados = categoria === "Todas" ? ARTICULOS : ARTICULOS.filter((a) => a.cat === categoria);
  const totalPaginas = Math.ceil(filtrados.length / articulosPorPagina);
  const paginados = filtrados.slice((page - 1) * articulosPorPagina, page * articulosPorPagina);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <PageHero
        eyebrow="Boletín diario · Actualidad verificada"
        title={<>Noticias <span className="italic text-primary">BVH</span></>}
        description="Análisis económico, avances regulatorios, movimientos de mercado y oportunidades para el empresariado cubano. Un correo al día, curado por nuestro equipo editorial."
      />

      <section className="mx-auto max-w-7xl px-6 py-12 md:py-16">
        <div className="mb-10 flex flex-wrap gap-2">
          {CATEGORIAS.map((c) => (
            <button
              key={c}
              onClick={() => { setCategoria(c); setPage(1); }}
              type="button"
              className={`rounded-full px-4 py-1.5 text-[11px] font-medium uppercase tracking-wide transition ${
                categoria === c
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {paginados.map((a) => (
            <article key={a.id} className="group relative rounded-xl border border-border bg-background overflow-hidden transition-colors hover:bg-card hover:border-primary/50">
              <div className="aspect-video bg-muted flex items-center justify-center">
                <span className="text-muted-foreground/50 text-[10px] uppercase tracking-widest">Imagen</span>
              </div>
              <div className="p-6 space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="rounded-full border border-border bg-secondary/60 px-2.5 py-0.5 text-[10px] uppercase tracking-widest text-primary">{a.cat}</span>
                  <span className="text-[10px] text-muted-foreground">{a.fecha}</span>
                  <span className="text-[10px] text-muted-foreground">{a.tiempo}</span>
                </div>
                <h2 className="font-serif text-lg leading-tight text-foreground group-hover:text-primary transition-colors">{a.titulo}</h2>
                <p className="text-[13px] leading-relaxed text-muted-foreground line-clamp-3">{a.excerpt}</p>
                <div className="pt-2 border-t border-border flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">Por {a.autor}</span>
                  <Link href={`/noticias/${a.slug}`} className="text-[11px] uppercase tracking-widest text-primary hover:underline">Leer →</Link>
                </div>
              </div>
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
            Suscríbete al <span className="italic text-primary">boletín diario</span>
          </h3>
          <p className="mt-4 max-w-xl mx-auto text-[14px] leading-relaxed text-muted-foreground">
            Recibe cada mañana el resumen ejecutivo de lo que importa en la economía cubana.
            Sin spam. Un correo al día. Cancela cuando quieras.
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