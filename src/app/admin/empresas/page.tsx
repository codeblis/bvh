import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import {
	AdminPageHeader,
	buttonPrimary,
	EmptyState,
	FormBanner,
	table,
	tableWrap,
	td,
	th,
} from "../_ui";

import { ConfirmSubmitButton } from "../ConfirmSubmitButton";
import { deleteCompany } from "./actions";

const errorMessages: Record<string, string> = {
	invalid: "La empresa indicada no es válida.",
	delete: "No se pudo eliminar la empresa. Inténtalo nuevamente.",
	"not-found": "Esa empresa ya no existe en el directorio.",
};

const successMessages: Record<string, string> = {
	created: "Empresa creada.",
	updated: "Empresa actualizada.",
	deleted: "Empresa eliminada.",
};

export default async function EmpresasPage({
	searchParams,
}: {
	searchParams: Promise<{ error?: string; saved?: string }>;
}) {
	const query = await searchParams;
	const { supabase } = await requireAdmin();
	const { data, error } = await supabase
		.from("companies")
		.select("id, name, sector, status")
		.order("name", { ascending: true });
	if (error)
		throw new Error(`No se pudieron cargar las empresas: ${error.message}`);
	const rows = data ?? [];

	return (
		<div>
			<FormBanner
				error={query.error}
				success={query.saved}
				errorMessages={errorMessages}
				successMessages={successMessages}
			/>
			<AdminPageHeader
				title="Empresas"
				description="Directorio público de empresas cotizando o interesadas."
				action={
					<Link href="/admin/empresas/nuevo" className={buttonPrimary}>
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
											<ConfirmSubmitButton
												message={`Eliminar «${r.name}» del directorio. Esta acción no se puede deshacer.`}
												className="text-xs text-destructive hover:underline"
											>
												Eliminar
											</ConfirmSubmitButton>
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
