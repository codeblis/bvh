"use client";

import { useState } from "react";
import { PageHero } from "@/components/bvh/PageHero";
import { SiteHeader } from "@/components/bvh/SiteHeader";
import { SiteFooter } from "@/components/bvh/SiteFooter";
import {
	CircleDollarSign,
	Eye,
	TrendingUp,
	Gem,
	RefreshCw,
	Handshake,
	Check,
} from "lucide-react";

const SECTORS = [
	"Agroindustria",
	"Tecnología",
	"Comercio",
	"Turismo",
	"Transporte",
	"Energía",
	"Finanzas",
	"Construcción",
	"Manufactura",
	"Salud",
	"Educación",
	"Otro",
];

const REVENUE_RANGES = [
	{ value: "<50k", label: "Menos de $50,000" },
	{ value: "50k-100k", label: "$50,000 – $100,000" },
	{ value: "100k-500k", label: "$100,000 – $500,000" },
	{ value: "500k-1m", label: "$500,000 – $1M" },
	{ value: "1m-5m", label: "$1M – $5M" },
	{ value: ">5m", label: "Más de $5M" },
];

const EMPLOYEE_RANGES = [
	"1–10",
	"11–50",
	"51–100",
	"101–250",
	"251–500",
	">500",
];

type FormData = {
	companyName: string;
	taxId: string;
	legalRep: string;
	email: string;
	phone: string;
	sector: string;
	founded: string;
	revenue: string;
	employees: string;
	description: string;
	acceptedTerms: boolean;
	wantsAdvisor: boolean;
};

const initialForm: FormData = {
	companyName: "",
	taxId: "",
	legalRep: "",
	email: "",
	phone: "",
	sector: "",
	founded: "",
	revenue: "",
	employees: "",
	description: "",
	acceptedTerms: false,
	wantsAdvisor: false,
};

export default function CotizarPage() {
	const [form, setForm] = useState<FormData>(initialForm);
	const [submitted, setSubmitted] = useState(false);
	const [errors, setErrors] = useState<
		Partial<Record<keyof FormData, boolean>>
	>({});

	const validate = () => {
		const e: Partial<Record<keyof FormData, boolean>> = {};
		if (!form.companyName.trim()) e.companyName = true;
		if (!form.taxId.trim()) e.taxId = true;
		if (!form.legalRep.trim()) e.legalRep = true;
		if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
			e.email = true;
		if (!form.phone.trim()) e.phone = true;
		if (!form.sector) e.sector = true;
		if (!form.founded.trim()) e.founded = true;
		if (!form.revenue) e.revenue = true;
		if (!form.employees) e.employees = true;
		if (!form.description.trim()) e.description = true;
		if (!form.acceptedTerms) e.acceptedTerms = true;
		setErrors(e);
		return Object.keys(e).length === 0;
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (validate()) {
			console.log("Form submitted:", form);
			setSubmitted(true);
		}
	};

	const update = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>,
	) => {
		const { name, value, type } = e.target;
		setForm((prev) => ({
			...prev,
			[name]:
				type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
		}));
		if (errors[name as keyof FormData])
			setErrors((prev) => ({ ...prev, [name]: undefined }));
	};

	if (submitted) {
		return (
			<div className="min-h-screen bg-background text-foreground">
				<SiteHeader />
				<PageHero
					eyebrow="Registro completado"
					title={
						<>
							Solicitud <span className="italic text-primary">enviada</span>
						</>
					}
					description="Gracias por registrar tu empresa. Un asesor BVH te contactará en 48–72 horas hábiles para la evaluación inicial."
				>
					<div className="mx-auto mt-8 max-w-md rounded-2xl border border-border bg-card/60 p-8 text-center">
						<div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-bvh-up/15 text-bvh-up">
							<Check className="w-7 h-7" aria-hidden="true" />
						</div>
						<p className="text-sm text-muted-foreground">
							Referencia:{" "}
							<span className="font-mono text-foreground">
								BVH-{Date.now().toString(36).toUpperCase()}
							</span>
						</p>
						<p className="mt-2 text-sm text-muted-foreground">
							Confirmación enviada a{" "}
							<span className="text-foreground">{form.email}</span>
						</p>
					</div>
					<div className="mt-6 flex justify-center gap-3">
						<a
							href="/instituto"
							className="rounded-md border border-border bg-card/60 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-foreground transition hover:bg-card"
						>
							Ir al Instituto
						</a>
						<a
							href="/mercados"
							className="rounded-md bg-primary px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-primary-foreground shadow-[var(--shadow-gold)] transition hover:brightness-110"
						>
							Conocer HSE →
						</a>
					</div>
				</PageHero>
				<SiteFooter />
			</div>
		);
	}

	const field = (
		name: keyof FormData,
		label: string,
		opts?: {
			placeholder?: string;
			type?: string;
			options?: { value: string; label: string }[];
			textarea?: boolean;
		},
	) => {
		const hasError = errors[name];
		const inputClass =
			"w-full rounded-lg border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none transition " +
			(hasError ? "border-destructive" : "border-border focus:border-primary");

		return (
			<div>
				<label
					htmlFor={name}
					className="mb-1.5 block text-xs font-medium text-foreground"
				>
					{label}
				</label>
				{opts?.options ? (
					<select
						id={name}
						name={name}
						value={form[name] as string}
						onChange={update}
						className={inputClass}
					>
						<option value="">Seleccionar</option>
						{opts.options.map((o) => (
							<option key={o.value} value={o.value}>
								{o.label}
							</option>
						))}
					</select>
				) : opts?.textarea ? (
					<textarea
						id={name}
						name={name}
						rows={4}
						value={form[name] as string}
						onChange={update}
						className={`${inputClass} resize-none`}
						placeholder={opts.placeholder}
					/>
				) : (
					<input
						id={name}
						name={name}
						type={opts?.type || "text"}
						value={form[name] as string}
						onChange={update}
						className={inputClass}
						placeholder={opts?.placeholder}
					/>
				)}
				{hasError && (
					<p className="mt-1 text-[11px] text-destructive">Campo obligatorio</p>
				)}
			</div>
		);
	};

	return (
		<div className="min-h-screen bg-background text-foreground">
			<SiteHeader />
			<PageHero
				eyebrow="RIE-BVH · Registro de Empresas"
				title={
					<>
						El camino hacia{" "}
						<span className="italic text-primary">Havana Stock Exchange</span>
					</>
				}
				description="Registra tu MIPYME y comienza la preparación para listar tus títulos en el Havana Stock Exchange."
			/>

			<section className="relative overflow-hidden border-b border-border text-center">
				<div className="mx-auto pointer-events-none absolute inset-0 opacity-[0.06]" />
				<div className="relative mx-auto max-w-7xl px-6 py-12 md:py-15">
					<div className="mb-3 text-[11px] uppercase tracking-[0.24em] text-primary">
						Lo que ganas al listar tu empresa
					</div>
					<h2 className="font-serif text-3xl leading-tight text-foreground md:text-5xl">
						¿Por qué cotizar en{" "}
						<span className="italic text-primary">BVH </span>?
					</h2>
					<p className="mt-4 text-sm leading-relaxed text-muted-foreground">
						Cotizar en el Havana Stock Exchange no es solo captar capital. Es
						transformar la forma en que tu empresa se proyecta, se gobierna y
						compite.
					</p>

					<div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
						{(
							[
								{
									icon: CircleDollarSign,
									title: "Acceso a capital",
									desc: "Captación de inversión de la diáspora cubana y fondos institucionales interesados en el mercado cubano.",
								},
								{
									icon: Eye,
									title: "Visibilidad",
									desc: "Exposición nacional e internacional a través de la plataforma BVH/HSE y su red de medios aliados.",
								},
								{
									icon: TrendingUp,
									title: "Profesionalización",
									desc: "Mejora en gobierno corporativo, estándares de reporting financiero y gestión empresarial.",
								},
								{
									icon: Gem,
									title: "Valoración de mercado",
									desc: "Precio de referencia objetivo determinado por el mercado, no por estimaciones internas.",
								},
								{
									icon: RefreshCw,
									title: "Liquidez para socios",
									desc: "Posibilidad de salida ordenada para accionistas iniciales y empleados mediante ESOPs.",
								},
								{
									icon: Handshake,
									title: "Red estratégica",
									desc: "Conexión directa con el Club de Inversión BVH, fondos de inversión y partners institucionales.",
								},
							] as const
						).map((b) => (
							<div
								key={b.title}
								className="flex flex-col items-center text-center bg-background p-4 transition-colors hover:bg-card sm:p-6 md:p-8"
							>
								<b.icon className="mb-4 w-7 h-7" aria-hidden="true" />
								<h3 className="font-semibold text-foreground">{b.title}</h3>
								<p className="mt-2 text-sm leading-relaxed text-muted-foreground">
									{b.desc}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			<section
				id="form-registro"
				className="mx-auto grid max-w-7xl gap-12 px-6 py-12 md:grid-cols-[1fr_360px] md:py-20"
			>
				<div>
					<h2 className="font-serif text-2xl text-foreground md:text-3xl">
						Formulario de registro
					</h2>
					<p className="mt-2 text-sm text-muted-foreground">
						Completa tus datos y un asesor te contactará en 48–72 horas.
					</p>

					<form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
						<div className="grid gap-5 md:grid-cols-2">
							{field("companyName", "Razón social", {
								placeholder: "Empresa Ejemplo S.A.",
							})}
							{field("taxId", "NIT", { placeholder: "1234567890" })}
							{field("legalRep", "Representante legal", {
								placeholder: "Juan Pérez García",
							})}
							{field("email", "Email corporativo", {
								type: "email",
								placeholder: "contacto@empresa.cu",
							})}
							{field("phone", "Teléfono", {
								type: "tel",
								placeholder: "+53 5 123 4567",
							})}
							{field("sector", "Sector", {
								options: SECTORS.map((s) => ({ value: s, label: s })),
							})}
							{field("founded", "Año de fundación", {
								type: "number",
								placeholder: "2020",
							})}
							{field("revenue", "Facturación anual (USD)", {
								options: REVENUE_RANGES,
							})}
						</div>

						<div className="grid gap-5 md:grid-cols-2">
							{field("employees", "Empleados", {
								options: EMPLOYEE_RANGES.map((e) => ({ value: e, label: e })),
							})}
						</div>

						{field("description", "Descripción del negocio", {
							placeholder:
								"Modelo de negocio, productos/servicios, mercado objetivo, ventajas competitivas…",
							textarea: true,
						})}

						<label className="flex items-start gap-3 cursor-pointer">
							<input
								name="acceptedTerms"
								type="checkbox"
								checked={form.acceptedTerms}
								onChange={update}
								className="mt-0.5 h-4 w-4 rounded border-border bg-background text-primary focus:ring-primary"
							/>
							<span className="text-sm text-muted-foreground">
								Acepto los{" "}
								<a href="/terminos" className="text-primary hover:underline">
									términos y condiciones
								</a>{" "}
								y la{" "}
								<a href="/privacidad" className="text-primary hover:underline">
									política de privacidad
								</a>{" "}
								de BVH.
							</span>
						</label>
						{errors.acceptedTerms && (
							<p className="text-[11px] text-destructive">
								Debes aceptar los términos
							</p>
						)}

						<label className="flex items-start gap-3 cursor-pointer">
							<input
								name="wantsAdvisor"
								type="checkbox"
								checked={form.wantsAdvisor}
								onChange={update}
								className="mt-0.5 h-4 w-4 rounded border-border bg-background text-primary focus:ring-primary"
							/>
							<span className="text-sm text-muted-foreground">
								Quiero que un asesor me contacte (opcional)
							</span>
						</label>

						<div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border pt-6">
							<p className="text-center sm:text-left sm:max-w-xs text-[11px] text-muted-foreground">
								Al enviar, autorizas a BVH a procesar tus datos para fines de
								evaluación de listado.
							</p>
							<button
								type="submit"
								className="shrink-0 rounded-lg bg-primary px-8 py-2.5 text-xs font-semibold uppercase tracking-wider text-primary-foreground shadow-[var(--shadow-gold)] transition hover:brightness-110"
							>
								Enviar solicitud
							</button>
						</div>
					</form>
				</div>

				<aside className="space-y-6">
					<div className="rounded-2xl border border-border bg-card/60 p-6">
						<h3 className="font-semibold text-foreground">Requisitos</h3>
						<ul className="mt-4 space-y-3 text-sm text-muted-foreground">
							{[
								"MIPYME formal con mínimo 2 años de operación",
								"Estados financieros auditados de los últimos 2 años",
								"Gobernanza definida (consejo, comités, estatutos)",
								"Capital social mínimo de $50,000 USD",
								"Plan de negocio a 3–5 años con proyecciones",
								"Compromiso de transparencia post-listado",
							].map((r) => (
								<li key={r} className="flex items-start gap-2">
									<span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
									{r}
								</li>
							))}
						</ul>
					</div>
					<div className="rounded-2xl border border-border bg-card/60 p-6">
						<h3 className="font-semibold text-foreground">Proceso</h3>
						<ol className="mt-4 space-y-4">
							{[
								{
									n: "01",
									t: "Registro",
									d: "Completa el formulario con los datos de tu empresa.",
								},
								{
									n: "02",
									t: "Evaluación",
									d: "Analizamos tu perfil y agendamos una reunión inicial.",
								},
								{
									n: "03",
									t: "Preparación",
									d: "Te acompañamos en gobernanza, finanzas y cumplimiento.",
								},
								{
									n: "04",
									t: "Cotización",
									d: "Listado en HSE (Etapa 2, 2027+).",
								},
							].map((s) => (
								<li key={s.n} className="flex gap-3">
									<span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/5 font-mono text-[10px] font-semibold text-primary">
										{s.n}
									</span>
									<div>
										<span className="text-sm font-medium text-foreground">
											{s.t}
										</span>
										<p className="text-xs text-muted-foreground">{s.d}</p>
									</div>
								</li>
							))}
						</ol>
					</div>
				</aside>
			</section>

			<SiteFooter />
		</div>
	);
}
