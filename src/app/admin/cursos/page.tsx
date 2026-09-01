import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { AdminPageHeader, EmptyState, table, tableWrap, td, th } from "../_ui";
import { deleteCourse } from "./actions";

export default async function CursosPage() {
	const { supabase } = await requireAdmin();
	const { data } = await supabase
		.from("courses")
		.select("id, title, instructor, start_date, capacity, price, status")
		.order("start_date", { ascending: true });
	const rows = data ?? [];

	return (
		<div>
			<AdminPageHeader
				title="Cursos"
				description="Catálogo del Instituto de Bolsa."
				action={
					<Link
						href="/admin/cursos/nuevo"
						className="rounded-md bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-wide text-primary-foreground"
					>
						Nuevo curso
					</Link>
				}
			/>
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
							{rows.map((r) => (
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
										{r.start_date
											? new Date(r.start_date).toLocaleDateString("es")
											: "—"}
									</td>
									<td className={td}>{r.capacity ?? "—"}</td>
									<td className={td}>
										{r.price != null ? `$${r.price}` : "—"}
									</td>
									<td className={td}>{r.status}</td>
									<td className={td}>
										<form action={deleteCourse}>
											<input type="hidden" name="id" value={r.id} />
											<button
												type="submit"
												className="text-xs text-destructive hover:underline"
											>
												Eliminar
											</button>
										</form>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}
