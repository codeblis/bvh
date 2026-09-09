import { requireAdmin } from "@/lib/admin";
import { APPLICATION_STATUSES } from "../_status";
import { AdminPageHeader, card, EmptyState, formatDateTime } from "../_ui";
import {
	NotificationResultBanner,
	NotificationStatus,
} from "../NotificationStatus";
import { StatusSelect } from "../StatusSelect";
import { updateApplicationStatus } from "./actions";

function fmt(value: string | null) {
	return formatDateTime(value);
}

export default async function SolicitudesPage({
	searchParams,
}: {
	searchParams: Promise<{ notification?: string; error?: string }>;
}) {
	const query = await searchParams;
	const { supabase } = await requireAdmin();
	const { data, error } = await supabase
		.from("company_applications")
		.select(
			"id, company_name, tax_id, legal_representative, corporate_email, phone, sector, founding_year, annual_revenue, employee_count, description, wants_advisor_contact, status, created_at, notification_status, notification_attempts",
		)
		.order("created_at", { ascending: false });
	if (error)
		throw new Error(`No se pudieron cargar las solicitudes: ${error.message}`);
	const rows = data ?? [];

	return (
		<div>
			<NotificationResultBanner
				result={query.notification}
				error={query.error}
			/>
			<AdminPageHeader
				title="Solicitudes RIE-BVH"
				description={
					rows.length === 1
						? "1 solicitud de registro de empresas."
						: `${rows.length} solicitudes de registro de empresas.`
				}
			/>
			{rows.length === 0 ? (
				<EmptyState>Todavía no hay solicitudes.</EmptyState>
			) : (
				<div className="space-y-4">
					{rows.map((r) => (
						<div key={r.id} className={card}>
							<div className="flex flex-wrap items-start justify-between gap-3">
								<div>
									<h2 className="font-serif text-lg">{r.company_name}</h2>
									<p className="text-xs text-muted-foreground">
										Recibida {fmt(r.created_at)}
									</p>
								</div>
								<StatusSelect
									action={updateApplicationStatus}
									id={r.id}
									current={r.status}
									options={APPLICATION_STATUSES}
								/>
								<NotificationStatus
									resourceType="company_application"
									id={r.id}
									status={r.notification_status}
									attempts={r.notification_attempts}
								/>
							</div>
							<dl className="mt-4 grid gap-x-6 gap-y-2 text-[13px] sm:grid-cols-2">
								<Row label="NIT / ID fiscal" value={r.tax_id} />
								<Row
									label="Representante legal"
									value={r.legal_representative}
								/>
								<Row
									label="Email corporativo"
									value={
										<a
											href={`mailto:${r.corporate_email}`}
											className="text-primary hover:underline"
										>
											{r.corporate_email}
										</a>
									}
								/>
								<Row label="Teléfono" value={r.phone} />
								<Row label="Sector" value={r.sector} />
								<Row label="Año de fundación" value={r.founding_year ?? "—"} />
								<Row
									label="Facturación anual"
									value={r.annual_revenue ?? "—"}
								/>
								<Row label="Empleados" value={r.employee_count ?? "—"} />
								<Row
									label="Quiere asesor"
									value={r.wants_advisor_contact ? "Sí" : "No"}
								/>
							</dl>
							{r.description ? (
								<p className="mt-3 whitespace-pre-wrap border-t border-border/60 pt-3 text-[13px] text-muted-foreground">
									{r.description}
								</p>
							) : null}
						</div>
					))}
				</div>
			)}
		</div>
	);
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
	return (
		<div className="flex gap-2">
			<dt className="min-w-[9rem] shrink-0 text-muted-foreground">{label}</dt>
			<dd className="font-medium">{value}</dd>
		</div>
	);
}
