import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/bvh/PageHero";
import { SiteFooter } from "@/components/bvh/SiteFooter";
import { SiteHeader } from "@/components/bvh/SiteHeader";
import { blockOutsideEditorialScope } from "@/lib/scope";
import { CourseCatalog } from "@/modules/courses/CourseCatalog";
import { listPublicCourses } from "@/modules/courses/repository.server";

export const metadata: Metadata = {
	title: "Instituto | BVH",
	description:
		"Cursos y ediciones abiertas del Instituto BVH: formación en educación financiera, empresa y mercado para el empresariado cubano.",
	alternates: { canonical: "/instituto" },
	openGraph: {
		title: "Instituto BVH",
		description:
			"Cursos y ediciones abiertas del Instituto BVH: formación en educación financiera, empresa y mercado para el empresariado cubano.",
		url: "/instituto",
		type: "website",
	},
};

export const dynamic = "force-dynamic";

export default async function InstitutoPage() {
	// Fuera del MVP editorial esta sección no se publica: el corte va antes
	// de consultar, para que una ruta que no existe tampoco toque la base.
	blockOutsideEditorialScope();
	const courses = await listPublicCourses();

	return (
		<div className="min-h-screen bg-background text-foreground">
			<SiteHeader />
			<main id="contenido">
			<PageHero
				eyebrow="Educación financiera · Instituto BVH"
				title={
					<>
						Formación para el{" "}
						<span className="italic text-primary">empresariado cubano</span>
					</>
				}
				description="Cursos prácticos de finanzas, gobernanza y mercados de capitales. Consulta las ediciones abiertas e inscríbete con tu cuenta BVH."
			/>

			<CourseCatalog courses={courses} />

			<section className="border-t border-border bg-card/40">
				<div className="mx-auto grid max-w-7xl gap-6 px-6 py-16 md:grid-cols-3">
					{[
						{
							title: "Contenido aplicable",
							text: "Programas orientados a decisiones financieras y empresariales reales.",
						},
						{
							title: "Ediciones trazables",
							text: "Cada fecha, modalidad, precio y cupo pertenece a una edición concreta.",
						},
						{
							title: "Inscripción BVH",
							text: "Tu cuenta conserva el estado de cada inscripción sin procesar pagos en línea.",
						},
					].map((item) => (
						<div
							key={item.title}
							className="rounded-xl border border-border bg-background p-6"
						>
							<h2 className="font-serif text-xl">{item.title}</h2>
							<p className="mt-3 text-sm leading-6 text-muted-foreground">
								{item.text}
							</p>
						</div>
					))}
				</div>
			</section>

			<section
				className="border-t border-border"
				style={{ background: "var(--gradient-hero)" }}
			>
				<div className="mx-auto max-w-4xl px-6 py-20 text-center">
					<p className="text-[10px] uppercase tracking-[0.24em] text-primary">
						Instituto BVH
					</p>
					<h2 className="mt-3 font-serif text-3xl md:text-4xl">
						¿Necesitas orientación antes de inscribirte?
					</h2>
					<p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
						Cuéntanos tu experiencia y objetivo. Te ayudaremos a escoger la
						edición adecuada.
					</p>
					<Link
						href="/contacto#contact-form"
						className="mt-7 inline-block rounded-md bg-primary px-6 py-3 text-xs font-semibold uppercase tracking-wider text-primary-foreground"
					>
						Contactar al Instituto
					</Link>
				</div>
			</section>

			</main>
			<SiteFooter />
		</div>
	);
}
