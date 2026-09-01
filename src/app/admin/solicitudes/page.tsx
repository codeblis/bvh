import { requireAdmin } from "@/lib/admin";
import { AdminPageHeader, EmptyState, card } from "../_ui";
import { APPLICATION_STATUSES } from "../_status";
import { StatusSelect } from "../StatusSelect";
import { updateApplicationStatus } from "./actions";

function fmt(value: string | null) {
	return value ? new Date(value).toLocaleString("es") : "—";
}

export default async function SolicitudesPage() {
	const { supabase } = await requireAdmin();
	const { data } = await supabase
		.from("company_applications")
		.select("*")
		.order("created_at", { ascending: false });
	const rows = data ?? [];

	return (
		<div>
			<AdminPageHeader
				title="Solicitudes RIE-BVH"
				description={`${rows.length} solicitud(es) de registro de empresas.`}
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
							</div>
							<dl className="mt-4 grid gap-x-6 gap-y-2 text-[13px] sm:grid-cols-2">
								<Row label="NIT / ID fiscal" value={r.tax_id} />
								<Row label="Representante legal" value={r.legal_representative} />
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
								<Row label="Facturación anual" value={r.annual_revenue ?? "—"} />
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

function Row({
	label,
	value,
}: {
	label: string;
	value: React.ReactNode;
}) {
	return (
		<div className="flex gap-2">
			<dt className="min-w-[9rem] shrink-0 text-muted-foreground">{label}</dt>
			<dd className="font-medium">{value}</dd>
		</div>
	);
}
