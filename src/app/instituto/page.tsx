"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHero } from "@/components/bvh/PageHero";
import { SiteHeader } from "@/components/bvh/SiteHeader";
import { SiteFooter } from "@/components/bvh/SiteFooter";
import { Clock, Calendar, Users, Smile } from "lucide-react";

const CURSOS = [
  {
    id: "fundamentos",
    n: "01",
    title: "Fundamentos de Valoración de Empresas",
    desc: "Métodos DCF, múltiplos comparables y valoración basada en activos adaptados al contexto cubano.",
    level: "Básico",
    modalidad: "Online",
    duracion: "6 semanas",
    precio: "$299 USD",
    instructor: "Dr. Carlos Méndez",
    inicio: "15 sep 2026",
    plazas: 30,
  },
  {
    id: "gobernanza",
    n: "02",
    title: "Gobernanza Corporativa para MIPYMES",
    desc: "Estructura de consejo, comités, transparencia y cumplimiento. Preparación para listado en HSE.",
    level: "Intermedio",
    modalidad: "Híbrido",
    duracion: "4 semanas",
    precio: "$399 USD",
    instructor: "Lic. Ana Rodríguez",
    inicio: "01 oct 2026",
    plazas: 25,
  },
  {
    id: "mercados",
    n: "03",
    title: "Introducción a Mercados de Capitales",
    desc: "Funcionamiento de bolsas, tipos de órdenes, participantes, regulación y rol del market maker.",
    level: "Básico",
    modalidad: "Online",
    duracion: "4 semanas",
    precio: "$199 USD",
    instructor: "MSc. Roberto García",
    inicio: "15 oct 2026",
    plazas: 40,
  },
  {
    id: "analisis",
    n: "04",
    title: "Análisis Fundamental y Técnico Aplicado",
    desc: "Lectura de estados financieros, ratios clave, patrones gráficos y gestión de riesgo.",
    level: "Avanzado",
    modalidad: "Presencial",
    duracion: "8 semanas",
    precio: "$599 USD",
    instructor: "Dra. María López",
    inicio: "01 nov 2026",
    plazas: 20,
  },
  {
    id: "fintech",
    n: "05",
    title: "Fintech y Digitalización Financiera",
    desc: "Pagos digitales, blockchain, DeFi regulado, APIs bancarias y transformación digital.",
    level: "Intermedio",
    modalidad: "Online",
    duracion: "5 semanas",
    precio: "$349 USD",
    instructor: "Ing. Carlos Herrera",
    inicio: "15 nov 2026",
    plazas: 35,
  },
  {
    id: "inversion",
    n: "06",
    title: "Club de Inversión: Práctica Real",
    desc: "Taller práctico de construcción de portafolio, due diligence y toma de decisiones en grupo.",
    level: "Avanzado",
    modalidad: "Híbrido",
    duracion: "6 semanas",
    precio: "$499 USD",
    instructor: "Equipo BVH",
    inicio: "01 dic 2026",
    plazas: 15,
  },
];

const EVENTOS = [
  { id: "evt-1", fecha: "20 sep", titulo: "Webinar: Perspectivas macro Cuba 2026-2027", tipo: "Gratuito", modalidad: "Online" },
  { id: "evt-2", fecha: "05 oct", titulo: "Panel: Experiencias de listado en mercados emergentes", tipo: "Miembros", modalidad: "Híbrido" },
  { id: "evt-3", fecha: "18 oct", titulo: "Taller: Modelado financiero para MIPYMES", tipo: "$150", modalidad: "Presencial" },
  { id: "evt-4", fecha: "02 nov", titulo: "Conferencia: El rol de la diáspora en el capital cubano", tipo: "Gratuito", modalidad: "Online" },
];

const NIVELES = ["Todos", "Básico", "Intermedio", "Avanzado"] as const;
const MODALIDADES = ["Todas", "Online", "Presencial", "Híbrido"] as const;

type Nivel = typeof NIVELES[number];
type Modalidad = typeof MODALIDADES[number];

export default function InstitutoPage() {
  const [nivel, setNivel] = useState<Nivel>("Todos");
  const [modalidad, setModalidad] = useState<Modalidad>("Todas");

  const filtrados = CURSOS.filter((c) =>
    (nivel === "Todos" || c.level === nivel) &&
    (modalidad === "Todas" || c.modalidad === modalidad)
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <PageHero
        eyebrow="Educación financiera · Instituto BVH"
        title={<>Formación para el <span className="italic text-primary">empresariado cubano</span></>}
        description="Cursos, talleres y certificaciones diseñados por expertos en finanzas, gobernanza y mercados de capitales. Metodología práctica, casos reales y certificación BVH."
      />

      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex flex-wrap gap-3 mb-10">
          {NIVELES.map((n) => (
            <button
              key={n}
              onClick={() => setNivel(n)}
              type="button"
              className={`rounded-full px-4 py-1.5 text-[11px] font-medium uppercase tracking-wide transition ${
                nivel === n
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 mb-10">
          {MODALIDADES.map((m) => (
            <button
              key={m}
              onClick={() => setModalidad(m)}
              type="button"
              className={`rounded-full px-4 py-1.5 text-[11px] font-medium uppercase tracking-wide transition ${
                modalidad === m
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtrados.map((c) => (
            <article key={c.id} className="relative rounded-xl border border-border bg-background p-6 transition-colors hover:bg-card hover:border-primary/50">
              <div className="mb-3 font-mono text-[11px] tracking-widest text-primary">{c.n}</div>
              <div className="mb-3 flex items-center gap-2 flex-wrap">
                <span className="rounded-full border border-border bg-secondary/60 px-2 py-0.5 text-[9px] uppercase tracking-widest text-muted-foreground">{c.level}</span>
                <span className="rounded-full border border-border bg-secondary/60 px-2 py-0.5 text-[9px] uppercase tracking-widest text-muted-foreground">{c.modalidad}</span>
              </div>
              <h3 className="font-serif text-lg leading-tight text-foreground">{c.title}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground line-clamp-2">{c.desc}</p>
              <div className="mt-4 space-y-1.5 text-[12px] text-muted-foreground">
                <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" aria-hidden="true" /><span>{c.duracion}</span></div>
                <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" aria-hidden="true" /><span>{c.inicio}</span></div>
                <div className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" aria-hidden="true" /><span>{c.instructor}</span></div>
                <div className="flex items-center gap-1.5"><Smile className="w-3.5 h-3.5" aria-hidden="true" /><span>{c.plazas} plazas</span></div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="font-semibold text-foreground">{c.precio}</span>
                <Link
                  href={`/instituto/${c.id}`}
                  className="rounded-md border border-primary/40 bg-primary/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-primary transition hover:bg-primary hover:text-primary-foreground"
                >
                  Inscribirse
                </Link>
              </div>
            </article>
          ))}
        </div>

        {filtrados.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            No hay cursos que coincidan con los filtros seleccionados.
          </div>
        )}
      </section>

      <section className="border-t border-border bg-card/40">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="mb-3 text-[11px] uppercase tracking-[0.24em] text-primary">Próximos eventos</div>
              <h2 className="font-serif text-3xl leading-tight text-foreground md:text-5xl">
                Webinars, talleres y <span className="italic text-primary">encuentros</span>
              </h2>
            </div>
          </div>
          <div className="overflow-x-auto rounded-xl border border-border bg-card/60">
            <table className="w-full text-left text-[13px]">
              <thead className="border-b border-border text-[10px] uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="px-5 py-4">Fecha</th>
                  <th className="px-5 py-4">Evento</th>
                  <th className="hidden px-5 py-4 md:table-cell">Tipo</th>
                  <th className="hidden px-5 py-4 lg:table-cell">Modalidad</th>
                  <th className="px-5 py-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {EVENTOS.map((e) => (
                  <tr key={e.id} className="transition-colors hover:bg-secondary/40">
                    <td className="px-5 py-4 font-mono text-[12px] text-primary">{e.fecha}</td>
                    <td className="px-5 py-4 font-sans text-foreground">{e.titulo}</td>
                    <td className="hidden px-5 py-4 md:table-cell">
                      <span className="rounded-full border border-border bg-secondary/60 px-2.5 py-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                        {e.tipo}
                      </span>
                    </td>
                    <td className="hidden px-5 py-4 lg:table-cell text-muted-foreground">{e.modalidad}</td>
                    <td className="px-5 py-4 text-right">
                      <Link href="/instituto/eventos" className="text-[11px] uppercase tracking-widest text-primary hover:underline">
                        Registrarse
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="border-t border-border" style={{ background: "var(--gradient-hero)" }}>
        <div className="relative mx-auto max-w-7xl px-6 py-24">
          <div className="relative rounded-2xl border border-border bg-card/70 p-8 md:p-12 shadow-[var(--shadow-elegant)] backdrop-blur text-center">
            <div className="mb-3 text-[10px] uppercase tracking-[0.24em] text-primary">Certificación profesional</div>
            <h3 className="font-serif text-2xl leading-tight text-foreground md:text-4xl max-w-2xl mx-auto">
              Conviértete en <span className="italic text-primary">Analista Certificado BVH</span>
            </h3>
            <p className="mt-4 max-w-xl mx-auto text-[14px] leading-relaxed text-muted-foreground">
              Completa el itinerario de 3 cursos obligatorios + 2 electivos y presenta el caso final.
              Certificación reconocida por el ecosistema BVH-HSE para asesores, directivos y analistas.
            </p>
            <div className="mt-8">
              <Link
                href="/instituto/certificacion"
                className="inline-block rounded-md bg-primary px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-primary-foreground shadow-[var(--shadow-gold)] transition hover:brightness-110"
              >
                Ver programa de certificación →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}