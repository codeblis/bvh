import { requireAdmin } from "@/lib/admin";
import { AdminPageHeader, EmptyState, table, tableWrap, td, th } from "../_ui";
import { CONTACT_STATUSES } from "../_status";
import { StatusSelect } from "../StatusSelect";
import { updateMessageStatus } from "./actions";

function fmt(value: string | null) {
	return value ? new Date(value).toLocaleString("es") : "—";
}

export default async function MensajesPage() {
	const { supabase } = await requireAdmin();
	const { data } = await supabase
		.from("contact_messages")
		.select("*")
		.order("created_at", { ascending: false });
	const rows = data ?? [];

	return (
		<div>
			<AdminPageHeader
				title="Mensajes de contacto"
				description={`${rows.length} mensaje(s) recibido(s).`}
			/>
			{rows.length === 0 ? (
				<EmptyState>Todavía no hay mensajes.</EmptyState>
			) : (
				<div className={tableWrap}>
					<table className={table}>
						<thead>
							<tr>
								<th className={th}>Fecha</th>
								<th className={th}>Remitente</th>
								<th className={th}>Asunto y mensaje</th>
								<th className={th}>Estado</th>
							</tr>
						</thead>
						<tbody>
							{rows.map((r) => (
								<tr key={r.id}>
									<td className={`${td} whitespace-nowrap`}>{fmt(r.created_at)}</td>
									<td className={td}>
										<div className="font-medium">{r.name}</div>
										<a
											href={`mailto:${r.email}`}
											className="text-primary hover:underline"
										>
											{r.email}
										</a>
									</td>
									<td className={`${td} max-w-md`}>
										<div className="font-medium">{r.subject || "—"}</div>
										<p className="mt-1 whitespace-pre-wrap text-muted-foreground">
											{r.message}
										</p>
									</td>
									<td className={td}>
										<StatusSelect
											action={updateMessageStatus}
											id={r.id}
											current={r.status ?? "pendiente"}
											options={CONTACT_STATUSES}
										/>
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
