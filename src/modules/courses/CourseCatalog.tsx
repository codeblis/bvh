"use client";

import { Calendar, Users } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { PublicCourse } from "./types";

function modalityLabel(value: string) {
	return value === "hibrido"
		? "Híbrido"
		: value === "por_confirmar"
			? "Por confirmar"
			: `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

function formatDate(value: string | null) {
	if (!value) return "Fecha por confirmar";
	return new Date(value).toLocaleDateString("es-CU", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	});
}

function formatPrice(price: number | null, currency: string) {
	if (price === null) return "Precio por confirmar";
	if (price === 0) return "Gratuito";
	return new Intl.NumberFormat("es", {
		style: "currency",
		currency,
		maximumFractionDigits: 2,
	}).format(price);
}

export function CourseCatalog({ courses }: { courses: PublicCourse[] }) {
	const modalities = useMemo(
		() => [
			"todas",
			...new Set(
				courses.flatMap((course) =>
					course.offerings.map((offering) => offering.modality),
				),
			),
		],
		[courses],
	);
	const [modality, setModality] = useState("todas");
	const filtered = courses.filter(
		(course) =>
			modality === "todas" ||
			course.offerings.some((offering) => offering.modality === modality),
	);

	return (
		<section className="mx-auto max-w-7xl px-6 py-12">
			<fieldset className="mb-8 flex flex-wrap gap-3">
				<legend className="sr-only">Filtrar por modalidad</legend>
				{modalities.map((value) => (
					<button
						key={value}
						type="button"
						onClick={() => setModality(value)}
						aria-pressed={modality === value}
						className={`rounded-full px-4 py-1.5 text-[11px] font-medium uppercase tracking-wide transition ${
							modality === value
								? "bg-primary text-primary-foreground"
								: "bg-secondary text-muted-foreground hover:text-foreground"
						}`}
					>
						{value === "todas" ? "Todas" : modalityLabel(value)}
					</button>
				))}
			</fieldset>

			{filtered.length === 0 ? (
				<p className="rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">
					No hay cursos abiertos para esta modalidad.
				</p>
			) : (
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{filtered.map((course) => {
						const offering = course.offerings[0];
						return (
							<article
								key={course.id}
								className="rounded-xl border border-border bg-background p-6 transition-colors hover:border-primary/50 hover:bg-card"
							>
								<div className="mb-3 flex flex-wrap gap-2">
									{offering ? (
										<span className="rounded-full border border-border bg-secondary/60 px-2 py-0.5 text-[9px] uppercase tracking-widest text-muted-foreground">
											{modalityLabel(offering.modality)}
										</span>
									) : null}
								</div>
								<h2 className="font-serif text-lg leading-tight">{course.title}</h2>
								<p className="mt-2 line-clamp-3 text-[13px] leading-relaxed text-muted-foreground">
									{course.description}
								</p>
								<div className="mt-4 space-y-2 text-xs text-muted-foreground">
									<div className="flex items-center gap-2">
										<Calendar className="h-3.5 w-3.5" aria-hidden="true" />
										{formatDate(offering?.startsAt ?? null)}
									</div>
									<div className="flex items-center gap-2">
										<Users className="h-3.5 w-3.5" aria-hidden="true" />
										{!offering
											? "Sin edición abierta"
											: offering.capacity === null
												? "Cupo abierto"
												: `${offering.availableSeats ?? 0} plazas disponibles`}
									</div>
								</div>
								<div className="mt-5 flex items-center justify-between gap-4">
									<span className="font-semibold">
										{offering
											? formatPrice(offering.price, offering.currency)
											: "Próximamente"}
									</span>
									<Link
										href={`/instituto/cursos/${course.slug}`}
										className="rounded-md border border-primary/40 bg-primary/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-primary transition hover:bg-primary hover:text-primary-foreground"
									>
										Ver curso
									</Link>
								</div>
							</article>
						);
					})}
				</div>
			)}
		</section>
	);
}
