"use client";

import { PageHero } from "@/components/bvh/PageHero";
import { SiteHeader } from "@/components/bvh/SiteHeader";
import { SiteFooter } from "@/components/bvh/SiteFooter";
import { Landmark, Zap, Wallet, Handshake, Sparkles, Search, Scale, GraduationCap, Microscope, Users } from "lucide-react";

const MISION = "Crear transparencia, análisis riguroso y educación financiera para los emprendedores e inversionistas cubanos dentro y fuera de la isla, siendo la casa de los emprendedores cubanos.";

const VISION = "Convertirse en la referencia financiera del Caribe y la principal plataforma que canaliza el ahorro nacional y de la diáspora hacia inversión productiva en Cuba para el año 2029-2035.";

const ESTRUCTURA = [
  { nombre: "BVH Core", rol: "Unidad matriz. Índices, análisis, RIE-BVH, educación, comunicación institucional.", icon: Landmark },
  { nombre: "HSE (Havana Stock Exchange)", rol: "Plataforma de negociación electrónica. Acciones, commodities, deuda, criptoactivos.", icon: Zap },
  { nombre: "Fondo de Inversión BVH", rol: "Vehículo de inversión que canaliza capital hacia MIPYMES de alto potencial.", icon: Wallet },
  { nombre: "Club de Inversión BVH", rol: "Comunidad exclusiva conectando inversores con oportunidades y empresas registradas.", icon: Handshake },
  { nombre: "Prediction Market BVH", rol: "Mercados de predicción sobre eventos económicos, regulatorios y sectoriales.", icon: Sparkles },
];

const EQUIPO = [
  { nombre: "Carlos Méndez", cargo: "Presidente & Fundador", bio: "Economista y emprendedor serial. 20 años en banca de inversión y mercados emergentes. Ex-BID, ex-Citi LatAm.", img: "/team/placeholder-1.svg" },
  { nombre: "Ana Rodríguez", cargo: "Directora de Gobernanza", bio: "Abogada especializada en derecho societario y compliance. Ex-socia en firma legal top 5 LatAm.", img: "/team/placeholder-2.svg" },
  { nombre: "Roberto García", cargo: "Director de Mercados / HSE", bio: "Ingeniero de sistemas y ex-CTO de exchange regional. Arquitectura de matching engines y custodia.", img: "/team/placeholder-3.svg" },
  { nombre: "María López", cargo: "Directora del Instituto BVH", bio: "PhD en Finanzas. Ex-profesora universitaria y consultora Banca Central. Certificada CFA.", img: "/team/placeholder-4.svg" },
  { nombre: "Jorge Herrera", cargo: "CTO / Head of Tech", bio: "Full-stack & DevOps. Construyó infraestructura fintech para 3 unicornios LatAm. Open source advocate.", img: "/team/placeholder-5.svg" },
  { nombre: "Elena Cruz", cargo: "Directora de Comunicaciones", bio: "Periodista económica y strategist de marca. Ex-directora de contenidos en medio financiero líder.", img: "/team/placeholder-6.svg" },
];

const VALORES = [
  { icon: Search, titulo: "Transparencia radical", desc: "Datos e información claros, verificables y accesibles." },
  { icon: Scale, titulo: "Neutralidad", desc: "Independencia política y corporativa en todos los análisis e índices." },
  { icon: GraduationCap, titulo: "Profesionalismo", desc: "Estándares equivalentes a instituciones financieras internacionales." },
  { icon: Microscope, titulo: "Rigor técnico", desc: "Metodologías sólidas y respaldadas en datos." },
  { icon: Handshake, titulo: "Accesibilidad", desc: "Diseñado para MIPYMES y emprendedores, no solo para grandes actores." },
  { icon: Users, titulo: "Trabajo en equipo", desc: "Colaboración entre todas las unidades del holding y con el ecosistema." },
];

export default function AcercaPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <PageHero
        eyebrow="Identidad · Propósito · Estructura"
        title={<>Acerca de <span className="italic text-primary">BVH</span></>}
        description="La Bolsa de Valores de La Habana es el primer proyecto de infraestructura financiera moderna en Cuba en más de seis décadas. Una iniciativa privada e independiente para llenar el vacío estructural de transparencia, valoración y canalización de capital."
      />

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card/60 p-6 sm:p-8">
            <h2 className="font-serif text-2xl text-foreground mb-4">Misión</h2>
            <p className="text-[14px] leading-relaxed text-muted-foreground">{MISION}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card/60 p-6 sm:p-8">
            <h2 className="font-serif text-2xl text-foreground mb-4">Visión</h2>
            <p className="text-[14px] leading-relaxed text-muted-foreground">{VISION}</p>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-card/40">
        <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
          <div className="text-center mb-14">
            <div className="mb-3 text-[11px] uppercase tracking-[0.24em] text-primary">Estructura del Holding</div>
            <h2 className="font-serif text-3xl leading-tight text-foreground md:text-4xl">
              Unidades <span className="italic text-primary">complementarias</span>
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-[14px] leading-relaxed text-muted-foreground">
              Modelo de holding con firewalls jurídicos claros. Cada unidad tiene propósito específico y gobernanza independiente.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {ESTRUCTURA.map((u) => (
              <div key={u.nombre} className="relative rounded-xl border border-border bg-background p-6 transition-colors hover:bg-card hover:border-primary/50">
                <div className="mb-3"><u.icon className="w-8 h-8" aria-hidden="true" /></div>
                <h3 className="font-serif text-xl text-foreground">{u.nombre}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{u.rol}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12 md:py-16">
        <div className="text-center mb-14">
          <div className="mb-3 text-[11px] uppercase tracking-[0.24em] text-primary">Principios que nos guían</div>
          <h2 className="font-serif text-3xl leading-tight text-foreground md:text-4xl">Valores <span className="italic text-primary">fundamentales</span></h2>
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
      </section>

      <section className="border-t border-border bg-card/40">
        <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
          <div className="text-center mb-14">
            <div className="mb-3 text-[11px] uppercase tracking-[0.24em] text-primary">Equipo directivo</div>
            <h2 className="font-serif text-3xl leading-tight text-foreground md:text-4xl">
              Las personas <span className="italic text-primary">detrás de BVH</span>
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-[14px] leading-relaxed text-muted-foreground">
              Experiencia combinada en banca de inversión, mercados, derecho societario, tecnología financiera, academia y comunicación.
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
                <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{e.bio}</p>
              </div>
            ))}
          </div>
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