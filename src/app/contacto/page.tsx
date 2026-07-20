"use client";

import { useState } from "react";
import { PageHero } from "@/components/bvh/PageHero";
import { SiteHeader } from "@/components/bvh/SiteHeader";
import { SiteFooter } from "@/components/bvh/SiteFooter";
import {
	Mail,
	GraduationCap,
	Building2,
	Handshake,
	Monitor,
	MapPin,
	Check,
} from "lucide-react";

const CONTACTOS = [
	{
		icon: Mail,
		titulo: "Prensa",
		email: "prensa@bvh.cu",
		desc: "Solicitudes de entrevista, notas de prensa, kit de marca.",
	},
	{
		icon: GraduationCap,
		titulo: "Instituto BVH",
		email: "instituto@bvh.cu",
		desc: "Inscripciones, certificaciones, programas a medida para empresas.",
	},
	{
		icon: Building2,
		titulo: "Listado / RIE-BVH",
		email: "listado@bvh.cu",
		desc: "Registro de empresas, evaluación inicial, asesores de cotización.",
	},
	{
		icon: Handshake,
		titulo: "Alianzas / Club",
		email: "alianzas@bvh.cu",
		desc: "Partners institucionales, miembros del Club de Inversión.",
	},
	{
		icon: Monitor,
		titulo: "Soporte técnico",
		email: "soporte@bvh.cu",
		desc: "Plataforma HSE, APIs, data feeds, incidencias.",
	},
	{
		icon: MapPin,
		titulo: "Oficinas",
		email: "Calle Obispo 158, La Habana Vieja",
		desc: "Lun–Vie 9:00–17:00 (GMT-5) · Solo con cita previa.",
		isAddress: true,
	},
];

type FormData = {
	nombre: string;
	email: string;
	asunto: string;
	mensaje: string;
};

const initialForm: FormData = {
	nombre: "",
	email: "",
	asunto: "",
	mensaje: "",
};

const ASUNTOS = [
	"Prensa / Entrevista",
	"Inscripción Instituto / Cursos",
	"Registro empresa (RIE-BVH)",
	"Club de Inversión / Alianzas",
	"Soporte técnico HSE / APIs",
	"Otro",
];

export default function ContactoPage() {
	const [form, setForm] = useState<FormData>(initialForm);
	const [enviado, setEnviado] = useState(false);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		console.log("Contacto:", form);
		setEnviado(true);
		setForm(initialForm);
	};

	const handleChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>,
	) => {
		setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
	};

	if (enviado) {
		return (
			<div className="min-h-screen bg-background text-foreground">
				<SiteHeader />
				<PageHero
					eyebrow="Mensaje enviado"
					title={
						<>
							¡Gracias por{" "}
							<span className="italic text-primary">contactarnos</span>!
						</>
					}
					description="Hemos recibido tu mensaje. Nuestro equipo te responderá en un plazo máximo de 48 horas hábiles."
				>
					<div className="max-w-xl mx-auto text-center space-y-6">
						<div className="rounded-xl border border-border bg-card/60 p-8">
							<div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[color:var(--bvh-up)]/15 text-[color:var(--bvh-up)]">
								<Check className="w-8 h-8" aria-hidden="true" />
							</div>
							<h3 className="font-serif text-2xl text-foreground">
								Mensaje enviado correctamente
							</h3>
							<p className="mt-2 text-muted-foreground">
								Referencia: BVH-CON-{Date.now().toString(36).toUpperCase()}
							</p>
						</div>
						<div className="flex flex-wrap gap-3 justify-center">
							<a
								href="/"
								className="rounded-md bg-primary px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-primary-foreground shadow-[var(--shadow-gold)] transition hover:brightness-110"
							>
								Volver al inicio
							</a>
							<a
								href="/instituto"
								className="rounded-md border border-border bg-card/60 px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-foreground transition hover:bg-card"
							>
								Ver cursos del Instituto
							</a>
						</div>
					</div>
				</PageHero>
				<SiteFooter />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background text-foreground">
			<SiteHeader />
			<PageHero
				eyebrow="Contacto institucional"
				title={
					<>
						Conversemos sobre el{" "}
						<span className="italic text-primary">futuro financiero</span> de
						Cuba
					</>
				}
				description="Prensa, alianzas institucionales, listado de empresas o consultas del Instituto — el equipo de la BVH responde en 48 horas hábiles."
			/>

			<section className="mx-auto max-w-7xl px-6 py-12 md:py-16" id="contact-form">
				<div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
					<div className="space-y-6">
						{CONTACTOS.map((c) => (
							<div
								key={c.titulo}
								className="rounded-xl border border-border bg-card/60 p-6"
							>
								<div className="flex items-start gap-4">
									<div className="flex shrink-0 items-center justify-center h-12 w-12 rounded-lg border border-border bg-secondary/60">
										<c.icon className="w-6 h-6" aria-hidden="true" />
									</div>
									<div>
										<h3 className="font-serif text-xl text-foreground">
											{c.titulo}
										</h3>
										{c.isAddress ? (
											<p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
												{c.email}
											</p>
										) : (
											<a
												href={`mailto:${c.email}`}
												className="mt-1 inline-block text-[14px] text-primary hover:underline"
											>
												{c.email}
											</a>
										)}
										<p className="mt-1 text-[12px] text-muted-foreground">
											{c.desc}
										</p>
									</div>
								</div>
							</div>
						))}
					</div>

					<div className="self-start rounded-2xl border border-border bg-card/70 p-6 md:p-8 shadow-[var(--shadow-elegant)] backdrop-blur lg:sticky lg:top-24">
						<h3 className="font-serif text-2xl text-foreground mb-6">
							Envíanos un mensaje
						</h3>
						<form onSubmit={handleSubmit} className="space-y-5" noValidate>
							<div className="grid gap-5 md:grid-cols-2">
								<div>
									<label
										htmlFor="nombre"
										className="block mb-1.5 text-[12px] font-medium text-foreground"
									>
										Nombre *
									</label>
									<input
										id="nombre"
										name="nombre"
										type="text"
										required
										value={form.nombre}
										onChange={handleChange}
										className="w-full rounded-md border border-border bg-background/80 px-4 py-3 text-[13px] text-foreground focus:border-primary focus:outline-none"
										placeholder="Tu nombre"
									/>
								</div>
								<div>
									<label
										htmlFor="email"
										className="block mb-1.5 text-[12px] font-medium text-foreground"
									>
										Email *
									</label>
									<input
										id="email"
										name="email"
										type="email"
										required
										value={form.email}
										onChange={handleChange}
										className="w-full rounded-md border border-border bg-background/80 px-4 py-3 text-[13px] text-foreground focus:border-primary focus:outline-none"
										placeholder="tu@correo.cu"
									/>
								</div>
							</div>
							<div>
								<label
									htmlFor="asunto"
									className="block mb-1.5 text-[12px] font-medium text-foreground"
								>
									Asunto *
								</label>
								<select
									id="asunto"
									name="asunto"
									required
									value={form.asunto}
									onChange={handleChange}
									className="w-full rounded-md border border-border bg-background/80 px-4 py-3 text-[13px] text-foreground focus:border-primary focus:outline-none"
								>
									<option value="">Selecciona un tema</option>
									{ASUNTOS.map((a) => (
										<option key={a} value={a}>
											{a}
										</option>
									))}
								</select>
							</div>
							<div>
								<label
									htmlFor="mensaje"
									className="block mb-1.5 text-[12px] font-medium text-foreground"
								>
									Mensaje *
								</label>
								<textarea
									id="mensaje"
									name="mensaje"
									required
									rows={5}
									value={form.mensaje}
									onChange={handleChange}
									className="w-full rounded-md border border-border bg-background/80 px-4 py-3 text-[13px] text-foreground focus:border-primary focus:outline-none resize-none"
									placeholder="Cuéntanos en qué podemos ayudarte..."
								/>
							</div>
							<button
								type="submit"
								className="w-full rounded-md bg-primary px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-primary-foreground shadow-[var(--shadow-gold)] transition hover:brightness-110"
							>
								Enviar mensaje
							</button>
							<p className="text-center text-[11px] text-muted-foreground">
								Al enviar, aceptas nuestra{" "}
								<a href="/privacidad" className="text-primary hover:underline">
									política de privacidad
								</a>
								. Responderemos en 48h hábiles.
							</p>
						</form>
					</div>
				</div>
			</section>

			<SiteFooter />
		</div>
	);
}
