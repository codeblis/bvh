import { Calendar, MapPin, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/bvh/SiteFooter";
import { SiteHeader } from "@/components/bvh/SiteHeader";
import { blockOutsideEditorialScope } from "@/lib/scope";
import { getPublicCourse } from "@/modules/courses/repository.server";
import type { CourseOffering } from "@/modules/courses/types";
import { enrollInCourse } from "./actions";

export const dynamic = "force-dynamic";

function formatDate(value: string | null, timeZone: string) {
	if (!value) return "Fecha por confirmar";
	return new Date(value).toLocaleString("es-CU", {
		day: "2-digit",
		month: "long",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		timeZone,
	});
}

function formatPrice(offering: CourseOffering) {
	if (offering.price === null) return "Precio por confirmar";
	if (offering.price === 0) return "Gratuito";
	return new Intl.NumberFormat("es", {
		style: "currency",
		currency: offering.currency,
		maximumFractionDigits: 2,
	}).format(offering.price);
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>;
}): Promise<Metadata> {
	const { slug } = await params;
	const course = await getPublicCourse(slug);
	if (!course) return {};
	return {
		title: `${course.title} | Instituto BVH`,
		description: course.description,
		alternates: { canonical: `/instituto/cursos/${course.slug}` },
	};
}

export default async function CoursePage({
	params,
	searchParams,
}: {
	params: Promise<{ slug: string }>;
	searchParams: Promise<{ enrolled?: string; enrollmentError?: string }>;
}) {
	// Fuera del MVP editorial esta sección no se publica: el corte va antes
	// de consultar, para que una ruta que no existe tampoco toque la base.
	blockOutsideEditorialScope();
	const { slug } = await params;
	const notices = await searchParams;
	const course = await getPublicCourse(slug);
	if (!course) notFound();

	return (
		<div className="min-h-screen bg-background text-foreground">
			<SiteHeader />
			<main>
				<header
					className="border-b border-border"
					style={{ background: "var(--gradient-hero)" }}
				>
					<div className="mx-auto max-w-4xl px-6 py-12 md:py-16">
						<Link
							href="/instituto"
							className="text-xs uppercase tracking-widest text-primary hover:underline"
						>
							← Volver al Instituto
						</Link>
						<h1 className="mt-5 font-serif text-3xl leading-tight md:text-5xl">
							{course.title}
						</h1>
						<p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">
							{course.description}
						</p>
						{course.instructor ? (
							<p className="mt-4 text-sm">Instructor: {course.instructor}</p>
						) : null}
					</div>
				</header>

				<div className="mx-auto grid max-w-4xl gap-10 px-6 py-12 lg:grid-cols-[1fr_320px]">
					<article className="space-y-4 text-sm leading-7 text-foreground/80">
						{(course.content.length > 0
							? course.content
							: [course.description]
						).map((paragraph) => (
							<p key={paragraph}>{paragraph}</p>
						))}
					</article>

					<aside>
						{notices.enrolled === "true" ? (
							<p
								className="mb-4 rounded-md border border-primary/40 bg-primary/10 p-4 text-sm"
								role="status"
							>
								Inscripción registrada. Puedes consultar su estado en tu cuenta.
							</p>
						) : null}
						{notices.enrollmentError ? (
							<p
								className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
								role="alert"
							>
								{notices.enrollmentError === "full"
									? "Esta edición ya no tiene plazas disponibles."
									: "No se pudo registrar la inscripción. Inténtalo nuevamente."}
							</p>
						) : null}

						<h2 className="mb-4 text-xs uppercase tracking-[0.2em] text-primary">
							Ediciones abiertas
						</h2>
						<div className="space-y-4">
							{course.offerings.length === 0 ? (
								<p className="rounded-xl border border-border p-5 text-sm text-muted-foreground">
									No hay ediciones abiertas en este momento.
								</p>
							) : (
								course.offerings.map((offering) => (
									<div
										key={offering.id}
										className="rounded-xl border border-border bg-card/60 p-5"
									>
										<div className="space-y-2 text-xs text-muted-foreground">
											<p className="flex items-center gap-2">
												<Calendar className="h-3.5 w-3.5" aria-hidden="true" />
												{formatDate(offering.startsAt, offering.timezone)}
											</p>
											{offering.endsAt ? (
												<p>
													Fin: {formatDate(offering.endsAt, offering.timezone)}
												</p>
											) : null}
											<p>Zona horaria: {offering.timezone}</p>
											<p className="flex items-center gap-2">
												<MapPin className="h-3.5 w-3.5" aria-hidden="true" />
												{offering.modality}
											</p>
											<p className="flex items-center gap-2">
												<Users className="h-3.5 w-3.5" aria-hidden="true" />
												{offering.capacity === null
													? "Cupo abierto"
													: `${offering.availableSeats ?? 0} plazas disponibles`}
											</p>
										</div>
										<p className="mt-4 font-semibold">
											{formatPrice(offering)}
										</p>
										<form action={enrollInCourse} className="mt-4">
											<input
												type="hidden"
												name="offeringId"
												value={offering.id}
											/>
											<input
												type="hidden"
												name="courseSlug"
												value={course.slug}
											/>
											<button
												type="submit"
												disabled={offering.availableSeats === 0}
												className="w-full rounded-md bg-primary px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
											>
												{offering.availableSeats === 0
													? "Sin plazas"
													: "Inscribirme"}
											</button>
										</form>
									</div>
								))
							)}
						</div>
					</aside>
				</div>
			</main>
			<SiteFooter />
		</div>
	);
}
