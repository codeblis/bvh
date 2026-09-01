import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import type { Tables } from "@/types/supabase";
import { COURSE_STATUSES } from "../../_status";
import { Field, SaveButton } from "../../_ui";
import { saveCourse } from "../actions";

export default async function CursoEditor({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const { supabase } = await requireAdmin();
	const isNew = id === "nuevo";

	let course: Tables<"courses"> | null = null;
	if (!isNew) {
		const { data } = await supabase
			.from("courses")
			.select("*")
			.eq("id", id)
			.maybeSingle();
		if (!data) notFound();
		course = data;
	}

	return (
		<div className="max-w-2xl">
			<Link
				href="/admin/cursos"
				className="text-xs text-muted-foreground hover:text-foreground"
			>
				← Volver a cursos
			</Link>
			<h1 className="mt-2 mb-6 font-serif text-2xl">
				{isNew ? "Nuevo curso" : "Editar curso"}
			</h1>
			<form action={saveCourse} className="space-y-4">
				{course ? <input type="hidden" name="id" value={course.id} /> : null}
				<Field label="Título" name="title" defaultValue={course?.title} required />
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
				<Field
					label="Imagen (URL)"
					name="image"
					defaultValue={course?.image}
				/>
				<Field
					label="Instructor"
					name="instructor"
					defaultValue={course?.instructor}
				/>
				<div className="grid gap-4 sm:grid-cols-2">
					<Field
						label="Fecha de inicio"
						name="start_date"
						type="date"
						defaultValue={course?.start_date}
					/>
					<Field
						label="Fecha de fin"
						name="end_date"
						type="date"
						defaultValue={course?.end_date}
					/>
					<Field
						label="Plazas"
						name="capacity"
						type="number"
						defaultValue={course?.capacity}
					/>
					<Field
						label="Precio (USD)"
						name="price"
						type="number"
						step="0.01"
						defaultValue={course?.price}
					/>
				</div>
				<Field
					label="Estado"
					name="status"
					defaultValue={course?.status ?? "activo"}
					options={COURSE_STATUSES}
				/>
				<SaveButton />
			</form>
		</div>
	);
}
