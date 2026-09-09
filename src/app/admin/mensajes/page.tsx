import { requireAdmin } from "@/lib/admin";
import { CONTACT_STATUSES } from "../_status";
import { AdminPageHeader, EmptyState, table, tableWrap, td, th } from "../_ui";
import {
	NotificationResultBanner,
	NotificationStatus,
} from "../NotificationStatus";
import { StatusSelect } from "../StatusSelect";
import { updateMessageStatus } from "./actions";

function fmt(value: string | null) {
	return value
		? new Date(value).toLocaleString("es", {
				day: "2-digit",
				month: "short",
				year: "numeric",
				hour: "2-digit",
				minute: "2-digit",
			})
		: "—";
}

export default async function MensajesPage({
	searchParams,
}: {
	searchParams: Promise<{ notification?: string; error?: string }>;
}) {
	const query = await searchParams;
	const { supabase } = await requireAdmin();
	const { data, error } = await supabase
		.from("contact_messages")
		.select(
			"id, name, email, subject, message, status, created_at, notification_status, notification_attempts",
		)
		.order("created_at", { ascending: false });
	if (error)
		throw new Error(`No se pudieron cargar los mensajes: ${error.message}`);
	const rows = data ?? [];

	return (
		<div>
			<NotificationResultBanner
				result={query.notification}
				error={query.error}
			/>
			<AdminPageHeader
				title="Mensajes de contacto"
				description={
					rows.length === 1
						? "1 mensaje recibido."
						: `${rows.length} mensajes recibidos.`
				}
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
								<th className={th}>Aviso</th>
							</tr>
						</thead>
						<tbody>
							{rows.map((r) => (
								<tr key={r.id}>
									<td className={`${td} whitespace-nowrap`}>
										{fmt(r.created_at)}
									</td>
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
									<td className={td}>
										<NotificationStatus
											resourceType="contact_message"
											id={r.id}
											status={r.notification_status}
											attempts={r.notification_attempts}
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
