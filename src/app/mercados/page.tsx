"use client";

import Link from "next/link";
import { PageHero } from "@/components/bvh/PageHero";
import { SiteHeader } from "@/components/bvh/SiteHeader";
import { SiteFooter } from "@/components/bvh/SiteFooter";
import { ArrowUp, ArrowDown, ArrowRight } from "lucide-react";

const EMPRESAS = [
	{
		sym: "AZCUBA",
		name: "Grupo Empresarial AZCUBA",
		sector: "Agroindustria",
		price: 142.5,
		change: 2.3,
		vol: "18,450",
		cap: "1.2B",
	},
	{
		sym: "ETECSA",
		name: "Empresa de Telecomunicaciones",
		sector: "Tecnología",
		price: 89.2,
		change: 0.8,
		vol: "32,100",
		cap: "980M",
	},
	{
		sym: "CIMEX",
		name: "CIMEX S.A.",
		sector: "Comercio",
		price: 67.8,
		change: -1.2,
		vol: "9,870",
		cap: "540M",
	},
	{
		sym: "GAESA",
		name: "Administración Empresarial",
		sector: "Conglomerado",
		price: 215.0,
		change: 3.1,
		vol: "5,200",
		cap: "2.4B",
	},
	{
		sym: "BFI",
		name: "Banco Financiero Internacional",
		sector: "Banca",
		price: 45.6,
		change: -0.5,
		vol: "6,410",
		cap: "410M",
	},
	{
		sym: "CUBACAB",
		name: "Cubacar S.A.",
		sector: "Transporte",
		price: 33.4,
		change: 1.7,
		vol: "2,980",
		cap: "190M",
	},
	{
		sym: "ISLAZUL",
		name: "Cadena Islazul",
		sector: "Turismo",
		price: 58.9,
		change: 0.4,
		vol: "7,640",
		cap: "320M",
	},
	{
		sym: "CUBANA",
		name: "Cubana de Aviación",
		sector: "Aeronáutica",
		price: 121.3,
		change: -2.8,
		vol: "3,120",
		cap: "620M",
	},
	{
		sym: "TRD",
		name: "TRD Caribe",
		sector: "Comercio",
		price: 76.5,
		change: 1.1,
		vol: "4,780",
		cap: "280M",
	},
	{
		sym: "CUPET",
		name: "Unión Cuba-Petróleo",
		sector: "Energía",
		price: 188.7,
		change: -0.9,
		vol: "14,300",
		cap: "1.8B",
	},
];

const MERCADOS = [
	{
		id: "acciones",
		title: "Mercado de Acciones",
		desc: "Empresas cubanas listadas para captación de capital y liquidez accionaria.",
		status: "En desarrollo",
		href: "/mercados/acciones",
	},
	{
		id: "commodities",
		title: "Mercado de Commodities",
		desc: "Azúcar, níquel, tabaco, ron, café y otros productos de exportación.",
		status: "Próximamente",
		href: "/mercados/commodities",
	},
	{
		id: "deuda",
		title: "Mercado de Deuda",
		desc: "Bonos soberanos, corporativos y municipales. Curva de rendimientos en CUP/USD.",
		status: "En evaluación",
		href: "/mercados/deuda",
	},
	{
		id: "cripto",
		title: "Criptoactivos",
		desc: "Tokens regulados, stablecoins y activos digitales bajo supervisión BVH.",
		status: "En evaluación",
		href: "/mercados/cripto",
	},
];

export default function MercadosPage() {
	return (
		<div className="min-h-screen bg-background text-foreground">
			<SiteHeader />
			<PageHero
				eyebrow="Mercado · Sesión en curso"
				title={
					<>
						Cotizaciones y <span className="italic text-primary">liquidez</span>{" "}
						en tiempo real
					</>
				}
				description="Todas las empresas cubanas listadas, con precio, variación diaria, volumen y capitalización simulados para la sesión de hoy."
			/>

			<section className="mx-auto max-w-7xl px-6 py-12 md:py-16">
				<div className="overflow-x-auto rounded-xl border border-border bg-card/60">
					<table className="w-full text-left text-[13px]">
						<thead className="border-b border-border text-[10px] uppercase tracking-widest text-muted-foreground">
							<tr>
								<th className="px-5 py-4">Ticker</th>
								<th className="px-5 py-4">Empresa</th>
								<th className="hidden px-5 py-4 md:table-cell">Sector</th>
								<th className="px-5 py-4 text-right">Precio</th>
								<th className="px-5 py-4 text-right">Var.</th>
								<th className="hidden px-5 py-4 text-right md:table-cell">
									Volumen
								</th>
								<th className="hidden px-5 py-4 text-right lg:table-cell">
									Cap.
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-border font-mono">
							{EMPRESAS.map((r) => (
								<tr
									key={r.sym}
									className="transition-colors hover:bg-secondary/40"
								>
									<td className="px-5 py-4 font-semibold tracking-wider text-primary">
										{r.sym}
									</td>
									<td className="px-5 py-4 font-sans text-foreground">
										{r.name}
									</td>
									<td className="hidden px-5 py-4 md:table-cell">
										<span className="rounded-full border border-border bg-secondary/60 px-2.5 py-1 text-[10px] uppercase tracking-widest text-muted-foreground">
											{r.sector}
										</span>
									</td>
									<td className="px-5 py-4 text-right text-foreground">
										{r.price.toFixed(2)}
									</td>
									<td className="px-5 py-4 text-right">
										<span
											className={`inline-block rounded-md px-2 py-1 text-[11px] ${
												r.change >= 0
													? "bg-[color:var(--bvh-up)]/15 text-[color:var(--bvh-up)]"
													: "bg-[color:var(--bvh-down)]/15 text-[color:var(--bvh-down)]"
											}`}
										>
											{r.change >= 0 ? (
												<>
													<ArrowUp
														className="w-3 h-3 inline"
														aria-hidden="true"
													/>{" "}
													+
												</>
											) : (
												<>
													<ArrowDown
														className="w-3 h-3 inline"
														aria-hidden="true"
													/>{" "}
												</>
											)}
											{r.change.toFixed(2)}%
										</span>
									</td>
									<td className="hidden px-5 py-4 text-right text-muted-foreground md:table-cell">
										{r.vol}
									</td>
									<td className="hidden px-5 py-4 text-right text-muted-foreground lg:table-cell">
										{r.cap}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</section>

			<section className="border-t border-border">
				<div className="mx-auto max-w-7xl px-6 py-16 md:py-24">
					<div className="mb-10 flex flex-wrap items-end justify-between gap-4">
						<div>
							<div className="mb-3 text-[11px] uppercase tracking-[0.24em] text-primary">
								Estructura de mercados
							</div>
							<h2 className="max-w-2xl font-serif text-3xl leading-tight text-foreground md:text-5xl">
								Los mercados que operará{" "}
								<span className="italic text-primary">HSE</span>
							</h2>
						</div>
					</div>

					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
						{MERCADOS.map((m) => (
							<Link
								key={m.id}
								href={m.href}
								className="group relative rounded-xl border border-border bg-background p-4 transition-colors hover:bg-card hover:border-primary/50 sm:p-6 md:p-8"
							>
								<div className="mb-4 flex items-center justify-between">
									<div className="font-mono text-[11px] tracking-widest text-primary">
										{m.id.toUpperCase()}
									</div>
									<span className="rounded-full border border-border bg-secondary/60 px-2.5 py-1 text-[10px] uppercase tracking-widest text-muted-foreground">
										{m.status}
									</span>
								</div>
								<h3 className="font-serif text-xl text-foreground group-hover:text-primary transition-colors">
									{m.title}
								</h3>
								<p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
									{m.desc}
								</p>
								<div className="mt-6 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-primary group-hover:gap-3 transition-colors">
									Ver detalles
									<ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
								</div>
							</Link>
						))}
					</div>

					<div className="mt-16 rounded-2xl border border-border bg-card/70 p-4 sm:p-8 shadow-[var(--shadow-elegant)] backdrop-blur">
						<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
							<div>
								<h3 className="font-serif text-2xl text-foreground">
									¿Quieres operar en HSE?
								</h3>
								<p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
									La plataforma de negociación Havana Stock Exchange (HSE)
									abrirá en Etapa 2. Regístrate para recibir acceso prioritario
									y actualizaciones técnicas.
								</p>
							</div>
							<Link
								href="/cotizar"
								className="rounded-md bg-primary w-fit whitespace-nowrap px-6 py-3 text-[12px] font-bold uppercase tracking-[0.14em] text-primary-foreground shadow-[var(--shadow-gold)] transition hover:brightness-110"
							>
								Acceso prioritario a HSE →
							</Link>
						</div>
					</div>
				</div>
			</section>

			<SiteFooter />
		</div>
	);
}
