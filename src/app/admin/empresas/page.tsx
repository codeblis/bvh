import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { AdminPageHeader, EmptyState, table, tableWrap, td, th } from "../_ui";
import { deleteCompany } from "./actions";

export default async function EmpresasPage() {
	const { supabase } = await requireAdmin();
	const { data } = await supabase
		.from("companies")
		.select("id, name, sector, status")
		.order("name", { ascending: true });
	const rows = data ?? [];

	return (
		<div>
			<AdminPageHeader
				title="Empresas"
				description="Directorio público de empresas cotizando o interesadas."
				action={
					<Link
						href="/admin/empresas/nuevo"
						className="rounded-md bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-wide text-primary-foreground"
					>
						Nueva empresa
					</Link>
				}
			/>
			{rows.length === 0 ? (
				<EmptyState>Sin empresas en el directorio.</EmptyState>
			) : (
				<div className={tableWrap}>
					<table className={table}>
						<thead>
							<tr>
								<th className={th}>Nombre</th>
								<th className={th}>Sector</th>
								<th className={th}>Estado</th>
								<th className={th} />
							</tr>
						</thead>
						<tbody>
							{rows.map((r) => (
								<tr key={r.id}>
									<td className={td}>
										<Link
											href={`/admin/empresas/${r.id}`}
											className="font-medium text-primary hover:underline"
										>
											{r.name}
										</Link>
									</td>
									<td className={td}>{r.sector || "—"}</td>
									<td className={td}>{r.status}</td>
									<td className={td}>
										<form action={deleteCompany}>
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
