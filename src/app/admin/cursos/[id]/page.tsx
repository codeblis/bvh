import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import type { Tables } from "@/types/supabase";
import {
	COURSE_STATUS_LABELS,
	COURSE_STATUSES,
	MODALITY_LABELS,
	OFFERING_STATUS_LABELS,
} from "../../_status";
import {
	buttonPrimary,
	EmptyState,
	Field,
	Flag,
	formatDate,
	panel,
	SaveButton,
	table,
	tableWrap,
	td,
	th,
} from "../../_ui";

import { saveCourse } from "../actions";

const FORM_ID = "editor-curso";

function offeringTone(status: string) {
	if (status === "abierta") return "hecho" as const;
	if (status === "borrador") return "espera" as const;
	if (status === "cancelada") return "fallo" as const;
	return "neutro" as const;
}

export default async function CursoEditor({
	params,
	searchParams,
}: {
	params: Promise<{ id: string }>;
	searchParams: Promise<{ error?: string; saved?: string }>;
}) {
	const { id } = await params;
	const notices = await searchParams;
	const { supabase } = await requireAdmin();
	const isNew = id === "nuevo";

	let course: Tables<"courses"> | null = null;
	let offerings: Tables<"course_offerings">[] = [];
	if (!isNew) {
		const [courseResult, offeringsResult] = await Promise.all([
			supabase.from("courses").select("*").eq("id", id).maybeSingle(),
			supabase
				.from("course_offerings")
				.select("*")
				.eq("course_id", id)
				.order("starts_at", { ascending: false, nullsFirst: false }),
		]);
		if (courseResult.error) {
			throw new Error(
				`No se pudo cargar el curso: ${courseResult.error.message}`,
			);
		}
		if (!courseResult.data) notFound();
		if (offeringsResult.error) {
			throw new Error(
				`No se pudieron cargar las ediciones: ${offeringsResult.error.message}`,
			);
		}
		course = courseResult.data;
		offerings = offeringsResult.data ?? [];
	}

	const isActive = course?.status === "activo";

	return (
		<div>
			<Link
				href="/admin/cursos"
				className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
			>
				<ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
				Cursos
			</Link>

			<div className="mt-3 mb-7 flex flex-wrap items-center gap-3 border-b border-border/60 pb-5">
				<h1 className="mr-auto font-serif text-[26px] leading-tight sm:text-[30px]">
					{isNew ? "Nuevo curso" : "Editar curso"}
				</h1>
				{course ? (
					<Flag tone={isActive ? "hecho" : "espera"}>
						{COURSE_STATUS_LABELS[course.status ?? ""] ?? course.status}
					</Flag>
				) : null}
			</div>

			{notices.saved ? (
				<p
					className="mb-5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400"
					role="status"
				>
					Curso guardado.
				</p>
			) : null}
			{notices.error ? (
				<p
					className="mb-5 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
					role="alert"
				>
					{notices.error === "invalid"
						? "Revisa los campos del curso."
						: "No se pudo guardar el curso. Inténtalo nuevamente."}
				</p>
			) : null}

			<div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-10">
				<form action={saveCourse} id={FORM_ID} className="min-w-0 space-y-6">
					{course ? <input type="hidden" name="id" value={course.id} /> : null}
					<div>
						<label
							htmlFor="title"
							className="mb-2 block text-[13px] font-medium text-foreground"
						>
							Título
						</label>
						<input
							id="title"
							name="title"
							defaultValue={course?.title ?? ""}
							required
							placeholder="Cómo se anuncia el curso en el catálogo"
							className="w-full border-0 border-b border-border/70 bg-transparent px-0 pb-3 font-serif text-[26px] leading-tight text-foreground transition-colors placeholder:text-muted-foreground/40 focus:border-primary focus:outline-none sm:text-[30px]"
						/>
					</div>
					<Field
						label="Descripción"
						name="description"
						defaultValue={course?.description}
						textarea
						rows={3}
						placeholder="Qué aprende quien lo cursa y para quién es."
						hint="Se muestra en el catálogo público y en la ficha del curso."
					/>
					<Field
						label="Contenido / temario"
						name="content"
						defaultValue={course?.content}
						textarea
						rows={16}
						placeholder="Módulos, sesiones y materiales. Admite Markdown."
					/>
				</form>

				<aside className="space-y-5 lg:sticky lg:top-24">
					<div className={`${panel} space-y-4 p-5`}>
						<h2 className="font-serif text-lg">Catálogo</h2>
						<Field
							form={FORM_ID}
							label="Estado del curso"
							name="status"
							defaultValue={course?.status ?? "borrador"}
							options={COURSE_STATUSES}
							optionLabels={COURSE_STATUS_LABELS}
							hint="Solo un curso activo con edición abierta aparece en el sitio."
						/>
						<Field
							form={FORM_ID}
							label="Instructor"
							name="instructor"
							defaultValue={course?.instructor}
						/>
						<Field
							form={FORM_ID}
							label="Imagen (URL)"
							name="image"
							defaultValue={course?.image}
						/>
						<Field
							form={FORM_ID}
							label="Slug"
							name="slug"
							defaultValue={course?.slug}
							hint={
								course
									? `Dirección pública: /instituto/cursos/${course.slug}`
									: "Se genera a partir del título."
							}
						/>
						<SaveButton full form={FORM_ID} />
					</div>
				</aside>
			</div>

			{course ? (
				<section className="mt-12 border-t border-border/60 pt-8">
					<div className="mb-5 flex flex-wrap items-end justify-between gap-4">
						<div>
							<h2 className="font-serif text-xl">Ediciones</h2>
							<p className="mt-1 text-sm text-muted-foreground">
								Cada edición tiene su calendario, cupo, precio y estado propios.
							</p>
						</div>
						<Link
							href={`/admin/cursos/${course.id}/ofertas/nueva`}
							className={buttonPrimary}
						>
							Nueva edición
						</Link>
					</div>

					{offerings.length === 0 ? (
						<EmptyState
							action={
								<Link
									href={`/admin/cursos/${course.id}/ofertas/nueva`}
									className={buttonPrimary}
								>
									Crear la primera edición
								</Link>
							}
						>
							Sin ediciones, el curso no aparece en el catálogo público aunque
							esté activo.
						</EmptyState>
					) : (
						<div className={tableWrap}>
							<table className={table}>
								<thead>
									<tr>
										<th className={th}>Inicio</th>
										<th className={th}>Modalidad</th>
										<th className={th}>Cupo</th>
										<th className={th}>Precio</th>
										<th className={th}>Estado</th>
										<th className={th} />
									</tr>
								</thead>
								<tbody>
									{offerings.map((offering) => (
										<tr
											key={offering.id}
											className="transition-colors hover:bg-secondary/20"
										>
											<td
												className={`${td} whitespace-nowrap tabular-nums text-muted-foreground`}
											>
												{offering.starts_at
													? formatDate(offering.starts_at)
													: "Por confirmar"}
											</td>
											<td className={`${td} text-muted-foreground`}>
												{MODALITY_LABELS[offering.modality ?? ""] ??
													offering.modality}
											</td>
											<td
												className={`${td} tabular-nums text-muted-foreground`}
											>
												{offering.capacity ?? "Sin límite"}
											</td>
											<td
												className={`${td} tabular-nums text-muted-foreground`}
											>
												{offering.price === null
													? "Por confirmar"
													: offering.price === 0
														? "Gratis"
														: `${offering.price} ${offering.currency}`}
											</td>
											<td className={td}>
												<Flag tone={offeringTone(offering.status ?? "")}>
													{OFFERING_STATUS_LABELS[offering.status ?? ""] ??
														offering.status}
												</Flag>
											</td>
											<td className={td}>
												<Link
													href={`/admin/cursos/${course.id}/ofertas/${offering.id}`}
													className="text-primary transition-colors hover:underline"
												>
													Editar
												</Link>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</section>
			) : (
				<p className="mt-8 text-sm text-muted-foreground">
					Guarda el catálogo primero. Después podrás añadir una o varias
					ediciones.
				</p>
			)}
		</div>
	);
}
