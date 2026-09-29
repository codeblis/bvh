import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import {
	AdminPageHeader,
	buttonPrimary,
	EmptyState,
	Flag,
	type FlagTone,
	FormBanner,
	formatDateTime,
	table,
	tableWrap,
	td,
	th,
} from "../_ui";

const STATUS_TONES: Record<string, { text: string; tone: FlagTone }> = {
	borrador: { text: "Borrador", tone: "neutro" },
	enviando: { text: "Enviando", tone: "espera" },
	enviada: { text: "Enviada", tone: "hecho" },
	fallida: { text: "Con fallos", tone: "fallo" },
};

function first<T>(value: T | T[] | null): T | null {
	return Array.isArray(value) ? (value[0] ?? null) : value;
}

export default async function CampaignsPage({
	searchParams,
}: {
	searchParams: Promise<{ error?: string; deleted?: string }>;
}) {
	const query = await searchParams;
	const { supabase } = await requireAdmin();

	const { data, error } = await supabase
		.from("newsletter_campaigns")
		.select(
			"id, subject, status, audience_kind, offering_scope, sent_at, created_at, newsletter_lists(name), course_offerings(starts_at, courses(title))",
		)
		.order("created_at", { ascending: false });
	if (error) {
		throw new Error(`No se pudieron cargar las campañas: ${error.message}`);
	}
	const rows = data ?? [];

	return (
		<div>
			<FormBanner
				error={query.error}
				success={query.deleted ? "deleted" : undefined}
				errorMessages={{
					invalid: "La campaña indicada no es válida.",
					save: "No se pudo guardar la campaña.",
					"not-found": "Esa campaña ya no existe.",
				}}
				successMessages={{ deleted: "Borrador eliminado." }}
			/>
			<AdminPageHeader
				title="Campañas"
				description="Boletines a las listas y avisos operativos a las audiencias de un curso."
				action={
					<Link href="/admin/campanas/nueva" className={buttonPrimary}>
						Nueva campaña
					</Link>
				}
			/>

			{rows.length === 0 ? (
				<EmptyState>
					Todavía no hay campañas. La primera se crea con «Nueva campaña».
				</EmptyState>
			) : (
				<div className={tableWrap}>
					<table className={table}>
						<thead>
							<tr>
								<th className={th}>Asunto</th>
								<th className={th}>Audiencia</th>
								<th className={th}>Estado</th>
								<th className={th}>Enviada</th>
							</tr>
						</thead>
						<tbody>
							{rows.map((row) => {
								const flag = STATUS_TONES[row.status] ?? {
									text: row.status,
									tone: "neutro" as FlagTone,
								};
								const list = first(row.newsletter_lists);
								const offering = first(row.course_offerings);
								const course = first(offering?.courses ?? null);
								return (
									<tr key={row.id}>
										<td className={td}>
											<Link
												href={`/admin/campanas/${row.id}`}
												className="font-medium text-primary hover:underline"
											>
												{row.subject}
											</Link>
										</td>
										<td className={td}>
											{row.audience_kind === "lista" ? (
												<>Lista · {list?.name ?? "—"}</>
											) : (
												<>
													Curso · {course?.title ?? "—"}
													<div className="mt-1 text-xs text-muted-foreground">
														{row.offering_scope === "inscritos"
															? "Inscritos"
															: row.offering_scope === "lista_espera"
																? "Lista de espera"
																: "Inscritos y lista de espera"}
													</div>
												</>
											)}
										</td>
										<td className={td}>
											<Flag tone={flag.tone}>{flag.text}</Flag>
										</td>
										<td className={`${td} whitespace-nowrap`}>
											{formatDateTime(row.sent_at)}
										</td>
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
