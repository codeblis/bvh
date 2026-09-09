import { requireAdmin } from "@/lib/admin";
import { AdminPageHeader, EmptyState, table, tableWrap, td, th } from "../_ui";
import {
	NotificationResultBanner,
	NotificationStatus,
} from "../NotificationStatus";

export default async function NewsletterPage({
	searchParams,
}: {
	searchParams: Promise<{ notification?: string; error?: string }>;
}) {
	const query = await searchParams;
	const { supabase } = await requireAdmin();
	const { data, error } = await supabase
		.from("newsletter_subscriptions")
		.select(
			"id, email, full_name, profile, source, subscribed_at, is_active, notification_status, notification_attempts",
		)
		.order("subscribed_at", { ascending: false });
	if (error)
		throw new Error(`No se pudo cargar el newsletter: ${error.message}`);
	const rows = data ?? [];
	const active = rows.filter((r) => r.is_active).length;

	return (
		<div>
			<NotificationResultBanner
				result={query.notification}
				error={query.error}
			/>
			<AdminPageHeader
				title="Newsletter"
				description={`${
					active === 1
						? "1 suscripción activa"
						: `${active} suscripciones activas`
				} de ${rows.length} en total.`}
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
								<th className={th}>Aviso</th>
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
									<td className={td}>
										<NotificationStatus
											resourceType="newsletter_subscription"
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
