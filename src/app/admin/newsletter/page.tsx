import { requireAdmin } from "@/lib/admin";
import { AdminPageHeader, EmptyState, table, tableWrap, td, th } from "../_ui";

export default async function NewsletterPage() {
	const { supabase } = await requireAdmin();
	const { data } = await supabase
		.from("newsletter_subscriptions")
		.select("*")
		.order("subscribed_at", { ascending: false });
	const rows = data ?? [];
	const active = rows.filter((r) => r.is_active).length;

	return (
		<div>
			<AdminPageHeader
				title="Newsletter"
				description={`${active} suscripción(es) activa(s) de ${rows.length} en total.`}
			/>
			{rows.length === 0 ? (
				<EmptyState>Sin suscriptores todavía.</EmptyState>
			) : (
				<div className={tableWrap}>
					<table className={table}>
						<thead>
							<tr>
								<th className={th}>Email</th>
								<th className={th}>Nombre</th>
								<th className={th}>Perfil</th>
								<th className={th}>Origen</th>
								<th className={th}>Alta</th>
								<th className={th}>Activa</th>
							</tr>
						</thead>
						<tbody>
							{rows.map((r) => (
								<tr key={r.id}>
									<td className={td}>{r.email}</td>
									<td className={td}>{r.full_name || "—"}</td>
									<td className={td}>{r.profile || "—"}</td>
									<td className={td}>{r.source || "—"}</td>
									<td className={`${td} whitespace-nowrap`}>
										{r.subscribed_at
											? new Date(r.subscribed_at).toLocaleDateString("es")
											: "—"}
									</td>
									<td className={td}>{r.is_active ? "Sí" : "No"}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}
