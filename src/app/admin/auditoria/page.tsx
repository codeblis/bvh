import { requireAdmin } from "@/lib/admin";
import type { Json } from "@/types/supabase";
import { ACTION_LABELS, RESOURCE_LABELS } from "../_status";
import { AdminPageHeader, EmptyState, table, tableWrap, td, th } from "../_ui";

function first<T>(value: T | T[] | null): T | null {
	return Array.isArray(value) ? (value[0] ?? null) : value;
}

function metadataStatus(metadata: Json) {
	if (!metadata || Array.isArray(metadata) || typeof metadata !== "object")
		return "—";
	const before = metadata.old_status;
	const after = metadata.new_status;
	if (
		typeof before === "string" &&
		typeof after === "string" &&
		before !== after
	) {
		return `${before} → ${after}`;
	}
	if (typeof after === "string") return after;
	return "—";
}

export default async function AuditPage() {
	const { supabase } = await requireAdmin();
	const { data, error } = await supabase
		.from("audit_events")
		.select(
			"id, created_at, action, resource_type, resource_id, result, metadata, profiles(full_name, email)",
		)
		.order("created_at", { ascending: false })
		.limit(200);
	if (error)
		throw new Error(`No se pudo cargar la auditoría: ${error.message}`);
	const rows = data ?? [];

	return (
		<div>
			<AdminPageHeader
				title="Auditoría"
				description="Últimos 200 cambios sensibles registrados en la misma transacción."
			/>
			{rows.length === 0 ? (
				<EmptyState>Todavía no hay eventos registrados.</EmptyState>
			) : (
				<div className={tableWrap}>
					<table className={table}>
						<thead>
							<tr>
								<th className={th}>Fecha</th>
								<th className={th}>Actor</th>
								<th className={th}>Acción</th>
								<th className={th}>Recurso</th>
								<th className={th}>Cambio de estado</th>
							</tr>
						</thead>
						<tbody>
							{rows.map((row) => {
								const actor = first(row.profiles);
								return (
									<tr key={row.id}>
										<td className={`${td} whitespace-nowrap`}>
											{new Date(row.created_at).toLocaleString("es-CU")}
										</td>
										<td className={td}>
											<div>{actor?.full_name || "Sistema"}</div>
											<div className="text-xs text-muted-foreground">
												{actor?.email ?? "—"}
											</div>
										</td>
										<td className={td}>
											{ACTION_LABELS[row.action] ?? row.action}
										</td>
										<td className={td}>
											<div>
												{RESOURCE_LABELS[row.resource_type] ??
													row.resource_type}
											</div>
											<code className="text-[10px] text-muted-foreground">
												{row.resource_id ?? "—"}
											</code>
										</td>
										<td className={td}>{metadataStatus(row.metadata)}</td>
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
