import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import type { Tables } from "@/types/supabase";
import { COURSE_STATUSES } from "../../_status";
import {
	buttonPrimary,
	EmptyState,
	Field,
	SaveButton,
	table,
	tableWrap,
	td,
	th,
} from "../../_ui";

import { saveCourse } from "../actions";

function formatDate(value: string | null) {
	return value
		? new Date(value).toLocaleString("es-CU", {
				dateStyle: "medium",
				timeStyle: "short",
			})
		: "Por confirmar";
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

	return (
		<div className="max-w-4xl">
			<Link
				href="/admin/cursos"
				className="text-xs text-muted-foreground hover:text-foreground"
			>
				← Volver a cursos
			</Link>
			<h1 className="mt-2 mb-6 font-serif text-2xl">
				{isNew ? "Nuevo curso" : "Editar curso"}
			</h1>
			{notices.saved ? (
				<p
					className="mb-4 rounded-md border border-primary/40 bg-primary/10 px-4 py-3 text-sm"
					role="status"
				>
					Curso guardado.
				</p>
			) : null}
			{notices.error ? (
				<p
					className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
					role="alert"
				>
					{notices.error === "invalid"
						? "Revisa los campos del curso."
						: "No se pudo guardar el curso. Inténtalo nuevamente."}
				</p>
			) : null}

			<form action={saveCourse} className="max-w-2xl space-y-4">
				{course ? <input type="hidden" name="id" value={course.id} /> : null}
				<Field
					label="Título"
					name="title"
					defaultValue={course?.title}
					required
				/>
				<Field
					label="Slug"
					name="slug"
					defaultValue={course?.slug}
					hint="Se genera a partir del título si lo dejas vacío."
				/>
				<Field
					label="Descripción"
					name="description"
					defaultValue={course?.description}
					textarea
				/>
				<Field
					label="Contenido / temario"
					name="content"
					defaultValue={course?.content}
					textarea
				/>
				<Field label="Imagen (URL)" name="image" defaultValue={course?.image} />
				<Field
					label="Instructor"
					name="instructor"
					defaultValue={course?.instructor}
				/>
				<Field
					label="Estado del curso"
					name="status"
					defaultValue={course?.status ?? "borrador"}
					options={COURSE_STATUSES}
				/>
				<SaveButton />
			</form>

			{course ? (
				<section className="mt-12 border-t border-border pt-8">
					<div className="mb-5 flex flex-wrap items-start justify-between gap-4">
						<div>
							<h2 className="font-serif text-xl">Ediciones</h2>
							<p className="mt-1 text-sm text-muted-foreground">
								Fechas, modalidad, precio, cupo y publicación.
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
						<EmptyState>Este curso todavía no tiene ediciones.</EmptyState>
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
										<tr key={offering.id}>
											<td className={`${td} whitespace-nowrap`}>
												{formatDate(offering.starts_at)}
											</td>
											<td className={td}>{offering.modality}</td>
											<td className={td}>
												{offering.capacity ?? "Sin límite"}
											</td>
											<td className={td}>
												{offering.price === null
													? "Por confirmar"
													: `${offering.price} ${offering.currency}`}
											</td>
											<td className={td}>{offering.status}</td>
											<td className={td}>
												<Link
													href={`/admin/cursos/${course.id}/ofertas/${offering.id}`}
													className="text-primary hover:underline"
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
