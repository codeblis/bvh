"use client";

import { PageHero } from "@/components/bvh/PageHero";
import { SiteHeader } from "@/components/bvh/SiteHeader";
import { SiteFooter } from "@/components/bvh/SiteFooter";
import { Landmark, TrendingUp, Lock, ClipboardList, Rocket, Zap, Search, Scale, GraduationCap, Microscope, Handshake, Users } from "lucide-react";

const HITOS = [
  { ano: "1914", titulo: "Fundación Bolsa de La Habana", desc: "Inicio de operaciones como mercado organizado de valores y commodities.", icon: Landmark },
  { ano: "1920-1950", titulo: "Época dorada", desc: "Más de 60 empresas listadas. Azúcar, tabaco, ferrocarriles y bancos cotizan activamente.", icon: TrendingUp },
  { ano: "1959", titulo: "Cese de operaciones", desc: "Transformación del sistema financiero cubano. La bolsa cierra tras 45 años de actividad.", icon: Lock },
  { ano: "1990s", titulo: "Intentos de reactivación", desc: "Proyectos académicos y gubernamentales exploran la reapertura sin concretarse.", icon: ClipboardList },
  { ano: "2026", titulo: "Nace BVH Holding", desc: "Emprendedores cubanos lanzan la Bolsa de Valores de La Habana como iniciativa privada independiente.", icon: Rocket },
  { ano: "2027+", titulo: "Lanzamiento HSE", desc: "Havana Stock Exchange inicia operaciones: matching engine, custodios, liquidadores.", icon: Zap },
];

const VALORES = [
  { icon: Search, titulo: "Transparencia radical", desc: "Datos e información claros, verificables y accesibles. Metodologías abiertas y auditoría permanente." },
  { icon: Scale, titulo: "Neutralidad", desc: "Independencia política y corporativa en todos los análisis, índices y decisiones de listado." },
  { icon: GraduationCap, titulo: "Profesionalismo", desc: "Estándares equivalentes a instituciones financieras internacionales. Certificaciones y formación continua." },
  { icon: Microscope, titulo: "Rigor técnico", desc: "Metodologías sólidas respaldadas en datos. Modelo cuantitativo + cualitativo para valoración." },
  { icon: Handshake, titulo: "Accesibilidad", desc: "Diseñado para MIPYMES y emprendedores, no solo para grandes actores. Costos razonables y soporte real." },
  { icon: Users, titulo: "Trabajo en equipo", desc: "Colaboración entre todas las unidades del holding y con el ecosistema externo (medios, universidades, diáspora)." },
];

const EQUIPO = [
  { nombre: "Carlos Méndez", cargo: "Presidente & Fundador", area: "Estrategia / Relaciones Institucionales", img: "/team/placeholder-1.svg" },
  { nombre: "Ana Rodríguez", cargo: "Directora de Gobernanza", area: "Cumplimiento / Preparación Listado", img: "/team/placeholder-2.svg" },
  { nombre: "Roberto García", cargo: "Director de Mercados", area: "HSE / Club de Inversión", img: "/team/placeholder-3.svg" },
  { nombre: "María López", cargo: "Directora del Instituto", area: "Educación / Certificaciones", img: "/team/placeholder-4.svg" },
  { nombre: "Jorge Herrera", cargo: "CTO / Head of Tech", area: "HSE Platform / Data / Fintech", img: "/team/placeholder-5.svg" },
  { nombre: "Elena Cruz", cargo: "Directora de Comunicaciones", area: "Prensa / Branding / Eventos", img: "/team/placeholder-6.svg" },
];

export default function HistoriaPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <PageHero
        eyebrow="Identidad · Origen · Rumbo"
        title={<>Historia de la <span className="italic text-primary">Bolsa de Valores de La Habana</span></>}
        description="De la plaza bursátil de 1914 a la infraestructura financiera del siglo XXI. Un recorrido por el pasado, el presente fundacional y el futuro que construimos cada día."
      />

      <section className="mx-auto max-w-7xl px-6 py-12 md:py-16">
        <h2 className="font-serif text-3xl leading-tight text-foreground md:text-4xl mb-10 text-center">
          Línea de tiempo: <span className="italic text-primary">110 años en perspectiva</span>
        </h2>
        <div className="relative">
          <div className="absolute left-6 sm:left-8 top-0 bottom-0 w-px bg-border" />
          {HITOS.map((h, i) => (
            <div key={h.ano} className="relative pl-16 pb-8 sm:pl-20 sm:pb-12 last:pb-0">
              <div className="absolute left-6 sm:left-8 top-0 -translate-x-1/2 flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary bg-background text-primary">
                <h.icon className="w-5 h-5" aria-hidden="true" />
              </div>
              <div className="ml-4">
                <div className="font-mono text-[11px] uppercase tracking-widest text-primary">{h.ano}</div>
                <h3 className="font-serif text-xl text-foreground mt-1">{h.titulo}</h3>
                <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{h.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-card/40">
        <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
          <div className="text-center mb-14">
            <div className="mb-3 text-[11px] uppercase tracking-[0.24em] text-primary">Principios que nos guían</div>
            <h2 className="font-serif text-3xl leading-tight text-foreground md:text-4xl">
              Valores <span className="italic text-primary">fundamentales</span>
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {VALORES.map((v) => (
              <div key={v.titulo} className="rounded-xl border border-border bg-background p-6 transition-colors hover:bg-card hover:border-primary/50">
                <div className="mb-3"><v.icon className="w-8 h-8" aria-hidden="true" /></div>
                <h3 className="font-serif text-xl text-foreground">{v.titulo}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12 md:py-16">
        <div className="text-center mb-14">
          <div className="mb-3 text-[11px] uppercase tracking-[0.24em] text-primary">Equipo directivo</div>
          <h2 className="font-serif text-3xl leading-tight text-foreground md:text-4xl">
            Las personas <span className="italic text-primary">detrás de BVH</span>
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-[14px] leading-relaxed text-muted-foreground">
            Experiencia en banca, mercados, derecho, tecnología y educación. Compromiso compartido con el empresariado cubano.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {EQUIPO.map((e) => (
            <div key={e.nombre} className="group relative rounded-xl border border-border bg-background p-6 transition-colors hover:bg-card hover:border-primary/50">
              <div className="aspect-square rounded-lg bg-muted mb-4 flex items-center justify-center">
                <span className="text-muted-foreground/50 text-[10px] uppercase tracking-widest">Foto</span>
              </div>
              <h3 className="font-serif text-lg text-foreground group-hover:text-primary transition-colors">{e.nombre}</h3>
              <p className="mt-1 text-[12px] font-medium text-primary">{e.cargo}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">{e.area}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border" style={{ background: "var(--gradient-hero)" }}>
        <div className="relative mx-auto max-w-3xl px-6 py-24 text-center">
          <div className="relative rounded-2xl border border-border bg-card/70 p-8 md:p-12 shadow-[var(--shadow-elegant)] backdrop-blur">
            <h3 className="font-serif text-2xl leading-tight text-foreground md:text-3xl">
              Nuestra <span className="italic text-primary">independencia</span> es innegociable
            </h3>
            <p className="mt-4 max-w-xl mx-auto text-[14px] leading-relaxed text-muted-foreground">
              BVH es una iniciativa 100% privada, sin accionistas estatales ni vínculos político-partidistas.
              Nuestra única lealtad es con la transparencia, el rigor técnico y el emprendedor cubano.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 justify-center">
              <a href="/contacto" className="rounded-md bg-primary px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-primary-foreground shadow-[var(--shadow-gold)] transition hover:brightness-110">
                Contactar al equipo
              </a>
              <a href="/docs/estatutos.pdf" className="rounded-md border border-border bg-background/60 px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-foreground transition hover:bg-background">
                Ver estatutos (PDF)
              </a>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}