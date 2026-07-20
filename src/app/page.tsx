"use client";

import Link from "next/link";
import { PageHero } from "@/components/bvh/PageHero";
import { SiteHeader } from "@/components/bvh/SiteHeader";
import { SiteFooter } from "@/components/bvh/SiteFooter";
import { ArrowUp, ArrowDown } from "lucide-react";

const STATS = [
	{ n: "14", plus: "+", l: "Empresas cotizando" },
	{ n: "5", plus: "", l: "Índices sectoriales" },
	{ n: "3", plus: "K+", l: "Emprendedores registrados" },
	{ n: "2026", plus: "", l: "Año de fundación" },
];

const SERVICIOS = [
	{
		n: "01",
		t: "Generación de transparencia",
		d: "Publicamos índices económicos, análisis de tasas de cambio y commodities con metodología abierta y verificable.",
	},
	{
		n: "02",
		t: "Inteligencia de mercado",
		d: "Estudios de análisis fundamental y técnico adaptados al contexto cubano, producidos por nuestro equipo especializado.",
	},
	{
		n: "03",
		t: "Educación financiera",
		d: "Formación para emprendedores a través del Instituto BVH. Cursos, talleres y certificaciones en finanzas.",
	},
	{
		n: "04",
		t: "Consultoría estratégica",
		d: "Acompañamos a MIPYMES en modelado de negocios, gestión de divisas y preparación para crecer.",
	},
	{
		n: "05",
		t: "Club de Inversión BVH",
		d: "Comunidad que conecta el ahorro con oportunidades productivas reales dentro y fuera de Cuba.",
	},
	{
		n: "06",
		t: "Habana Stock Exchange",
		d: "El núcleo operativo del mercado. Libro de órdenes, participantes y liquidez en tiempo real.",
	},
];

export default function Home() {
	return (
		<div className="min-h-screen bg-background text-foreground">
			<SiteHeader />

			<PageHero
				eyebrow="Sesión 2026 · Mercado abierto"
				title={
					<>
						El capital cubano,
						<br />
						<span className="italic text-primary">reencontrado.</span>
					</>
				}
				description="Rescatamos el legado financiero de La Habana del siglo XX y lo proyectamos al XXI con una infraestructura moderna, transparente y educativa para el empresariado cubano — dentro y fuera de la isla."
			>
				<div className="flex flex-wrap gap-3">
					<Link
						href="/cotizar#form-registro"
						className="rounded-md bg-primary px-6 py-4 text-[12px] font-semibold uppercase tracking-[0.14em] text-primary-foreground shadow-[var(--shadow-gold)] transition hover:brightness-110"
					>
						Quiero ser parte de la BVH
					</Link>
					<Link
						href="/instituto"
						className="rounded-md border border-border bg-card/40 px-6 py-4 text-[12px] font-semibold uppercase tracking-[0.14em] text-foreground transition hover:bg-card"
					>
						Instituto BVH →
					</Link>
				</div>
				<div className="mt-14 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] uppercase tracking-widest text-muted-foreground">
					<span>Regulación abierta</span>
					<span className="h-3 w-px bg-border" />
					<span>Datos verificables</span>
					<span className="h-3 w-px bg-border" />
					<span>Neutralidad institucional</span>
				</div>
			</PageHero>

			{/* STATS */}
			<section className="border-b border-border bg-card/40">
				<div className="mx-auto grid grid-cols-2 gap-px bg-border md:grid-cols-4">
					{STATS.map((s) => (
						<div key={s.l} className="bg-background px-4 py-6 text-center sm:px-8 sm:py-10">
							<div className="font-serif text-4xl font-semibold text-primary md:text-5xl">
								{s.n}
								<span className="text-2xl text-muted-foreground">{s.plus}</span>
							</div>
							<div className="mt-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
								{s.l}
							</div>
						</div>
					))}
				</div>
			</section>

			{/* SERVICIOS */}
			<section
				className="border-b border-border"
				style={{ background: "var(--gradient-hero)" }}
			>
				<div className="mx-auto max-w-7xl px-6 py-24">
					<div className="mb-20 max-w-6xl text-center">
						<div className="mb-3 text-[11px] uppercase tracking-[0.24em] text-primary">
							Funciones & Servicios
						</div>
						<h2 className="font-serif text-3xl leading-tight text-foreground md:text-4xl">
							Todo lo que necesita{" "}
							<span className="italic text-primary">el emprendedor cubano</span>
							, en un solo lugar
						</h2>
					</div>
					<div className="grid gap-px bg-border md:grid-cols-2 lg:grid-cols-3  grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3 cursor-pointer">
						{SERVICIOS.map((s) => (
							<div
								key={s.n}
								className="group relative bg-background p-4 transition-colors hover:bg-card sm:p-6 md:p-8"
							>
								<div className="mb-6 font-mono text-[20px] tracking-widest text-primary">
									{s.n}
								</div>
								<h3 className="font-serif text-2xl text-foreground">{s.t}</h3>
								<p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
									{s.d}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* CONTACTO + NEWSLETTER */}
			<section
				className="relative overflow-hidden border-b border-border"
				style={{ background: "var(--gradient-hero)" }}
			>
				<div
					className="pointer-events-none absolute inset-0 opacity-[0.06]"
					style={{
						backgroundImage:
							"linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)",
						backgroundSize: "56px 56px",
					}}
				/>
				<div className="relative mx-auto grid max-w-7xl gap-14 px-6 py-24 md:grid-cols-[1.1fr_1fr] md:py-32">
					<div className="fade-up">
						<div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-primary">
							<span className="h-1 w-1 rounded-full bg-primary" /> Contacto
							institucional
						</div>
						<h2 className="max-w-2xl font-serif text-3xl leading-[1.1] text-foreground md:text-5xl">
							Conversemos sobre el{" "}
							<span className="italic text-primary">futuro financiero</span> de
							Cuba
						</h2>
						<p className="mt-6 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
							Prensa, alianzas institucionales, listado de empresas o consultas
							del Instituto — el equipo de la BVH responde en 48 horas hábiles.
						</p>
						<div className="mt-8 grid gap-4 sm:grid-cols-2">
							<div className="rounded-xl border border-border bg-card/60 p-5">
								<div className="text-[10px] uppercase tracking-[0.24em] text-primary">
									Prensa
								</div>
								<p className="mt-2 text-[14px] text-foreground">
									prensa@bvh.cu
								</p>
							</div>
							<div className="rounded-xl border border-border bg-card/60 p-5">
								<div className="text-[10px] uppercase tracking-[0.24em] text-primary">
									Instituto
								</div>
								<p className="mt-2 text-[14px] text-foreground">
									instituto@bvh.cu
								</p>
							</div>
							<div className="rounded-xl border border-border bg-card/60 p-5">
								<div className="text-[10px] uppercase tracking-[0.24em] text-primary">
									Oficinas
								</div>
								<p className="mt-2 text-[14px] text-foreground">
									Calle Obispo · La Habana Vieja
								</p>
							</div>
							<div className="rounded-xl border border-border bg-card/60 p-5">
								<div className="text-[10px] uppercase tracking-[0.24em] text-primary">
									Horario
								</div>
								<p className="mt-2 text-[14px] text-foreground">
									Lun a Vie · 9:00 – 17:00 (GMT-5)
								</p>
							</div>
						</div>
						<div className="mt-8">
							<Link
								href="/contacto#contact-form"
								className="inline-block rounded-md bg-primary px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-primary-foreground shadow-[var(--shadow-gold)] transition hover:brightness-110"
							>
								Ir al formulario de contacto →
							</Link>
						</div>
					</div>

					<div
						className="fade-up rounded-2xl border border-border bg-card/70 p-4 shadow-[var(--shadow-elegant)] backdrop-blur sm:p-8 md:p-10"
						style={{ background: "var(--gradient-hero)" }}
					>
						<div className="mb-3 text-[10px] uppercase tracking-[0.24em] text-primary">
							Newsletter institucional BVH
						</div>
						<h3 className="font-serif text-2xl leading-tight text-foreground md:text-3xl">
							La BVH por dentro, una vez al mes
						</h3>
						<p className="mt-4 text-[14px] leading-relaxed text-muted-foreground">
							Reportes institucionales, memorias, cambios regulatorios, nuevas
							empresas listadas y anuncios oficiales de la Bolsa. Distinto al
							boletín diario de noticias y a los ensayos semanales del blog.
						</p>
						<form
							onSubmit={(e) => e.preventDefault()}
							className="mt-6 space-y-3"
						>
							<div className="grid gap-3 sm:grid-cols-2">
								<input
									required
									placeholder="Nombre"
									className="w-full rounded-md border border-border bg-background/80 px-4 py-3 text-[13px] text-foreground focus:border-primary focus:outline-none"
								/>
								<input
									required
									type="email"
									placeholder="tu@correo.cu"
									className="w-full rounded-md border border-border bg-background/80 px-4 py-3 text-[13px] text-foreground focus:border-primary focus:outline-none"
								/>
							</div>
							<select className="w-full rounded-md border border-border bg-background/80 px-4 py-3 text-[13px] text-foreground focus:border-primary focus:outline-none">
								<option>Perfil: Emprendedor / MIPYME</option>
								<option>Perfil: Inversor</option>
								<option>Perfil: Prensa / Investigación</option>
								<option>Perfil: Diáspora</option>
								<option>Perfil: Otro</option>
							</select>
							<button
								type="submit"
								className="w-full rounded-md bg-primary px-5 py-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-primary-foreground transition hover:brightness-110"
							>
								Suscribirme al boletín institucional
							</button>
							<p className="text-[11px] text-muted-foreground">
								Un correo al mes · sin spam · puedes darte de baja cuando
								quieras.
							</p>
						</form>
						<div className="mt-6 flex flex-wrap gap-2 border-t border-border pt-5 text-[11px]">
							<Link
								href="/noticias"
								className="rounded-full border border-border bg-background/60 px-3 py-1.5 uppercase tracking-widest text-muted-foreground hover:text-foreground"
							>
								¿Boletín diario? → Noticias
							</Link>
							<Link
								href="/blog"
								className="rounded-full border border-border bg-background/60 px-3 py-1.5 uppercase tracking-widest text-muted-foreground hover:text-foreground"
							>
								¿Boletín semanal? → Blog
							</Link>
						</div>
					</div>
				</div>
			</section>

			<SiteFooter />
		</div>
	);
}
