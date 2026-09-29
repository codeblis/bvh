import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import {
	AdminPageHeader,
	buttonGhost,
	buttonPrimary,
	EmptyState,
	Flag,
	table,
	tableWrap,
	td,
	th,
} from "../_ui";
import { ConfirmSubmitButton } from "../ConfirmSubmitButton";
import { archiveCourse } from "./actions";

export default async function CursosPage({
	searchParams,
}: {
	searchParams: Promise<{ error?: string }>;
}) {
	const { error: queryError } = await searchParams;
	const { supabase } = await requireAdmin();
	const { data, error } = await supabase
		.from("courses")
		.select(
			"id, title, instructor, status, course_offerings(starts_at, capacity, price, currency, status)",
		)
		.order("title");
	if (error)
		throw new Error(`No se pudieron cargar los cursos: ${error.message}`);
	const rows = data ?? [];

	return (
		<div>
			<AdminPageHeader
				title="Cursos"
				description="Catálogo del Instituto de Bolsa."
				action={
					<div className="flex flex-wrap gap-2">
						<Link href="/admin/cursos/inscripciones" className={buttonGhost}>
							Inscripciones
						</Link>
						<Link href="/admin/cursos/nuevo" className={buttonPrimary}>
							Nuevo curso
						</Link>
					</div>
				}
			/>
			{queryError ? (
				<p
					className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
					role="alert"
				>
					No se pudo completar la operación con el curso.
				</p>
			) : null}
			{rows.length === 0 ? (
				<EmptyState>Sin cursos. Crea el primero.</EmptyState>
			) : (
				<div className={tableWrap}>
					<table className={table}>
						<thead>
							<tr>
								<th className={th}>Título</th>
								<th className={th}>Instructor</th>
								<th className={th}>Inicio</th>
								<th className={th}>Plazas</th>
								<th className={th}>Precio</th>
								<th className={th}>Estado</th>
								<th className={th} />
							</tr>
						</thead>
						<tbody>
							{rows.map((r) => {
								const offering =
									r.course_offerings.find(
										(item) => item.status === "abierta",
									) ?? r.course_offerings[0];
								return (
									<tr key={r.id}>
										<td className={td}>
											<Link
												href={`/admin/cursos/${r.id}`}
												className="font-medium text-primary hover:underline"
											>
												{r.title}
											</Link>
										</td>
										<td className={td}>{r.instructor || "—"}</td>
										<td className={`${td} whitespace-nowrap`}>
											{offering?.starts_at
												? new Date(offering.starts_at).toLocaleDateString("es")
												: "—"}
										</td>
										<td className={`${td} tabular-nums text-muted-foreground`}>
											{offering?.capacity ?? "—"}
										</td>
										<td className={td}>
											{offering?.price === 0
												? "Gratis"
												: offering?.price != null
													? `${offering.price} ${offering.currency}`
													: "—"}
										</td>
										<td className={td}>
											<Flag
												tone={
													r.status === "activo"
														? "hecho"
														: r.status === "borrador"
															? "espera"
															: "neutro"
												}
											>
												{r.status === "activo"
													? "Activo"
													: r.status === "borrador"
														? "Borrador"
														: "Archivado"}
											</Flag>
										</td>
										<td className={td}>
											<form action={archiveCourse}>
												<input type="hidden" name="id" value={r.id} />
												<ConfirmSubmitButton
													message="Archivar el curso cerrará todas sus ediciones abiertas. El historial se conservará."
													className="text-xs text-destructive hover:underline"
												>
													Archivar
												</ConfirmSubmitButton>
											</form>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}
