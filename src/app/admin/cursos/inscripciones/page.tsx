import Link from "next/link";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import {
	ENROLLMENT_STATUS_LABELS,
	ENROLLMENT_STATUSES,
	MODALITY_LABELS,
} from "../../_status";
import {
	AdminPageHeader,
	buttonGhost,
	EmptyState,
	formatDate,
	formatDateTime,
	table,
	tableWrap,
	td,
	th,
} from "../../_ui";

import { StatusSelect } from "../../StatusSelect";
import { updateEnrollmentStatus } from "./actions";

function first<T>(value: T | T[] | null): T | null {
	return Array.isArray(value) ? (value[0] ?? null) : value;
}

export default async function CourseEnrollmentsPage({
	searchParams,
}: {
	searchParams: Promise<{ error?: string; offering?: string }>;
}) {
	const query = await searchParams;
	const parsedOffering = z.string().uuid().safeParse(query.offering);
	const offeringId = parsedOffering.success ? parsedOffering.data : undefined;
	const { supabase } = await requireAdmin();
	let request = supabase
		.from("course_enrollments")
		.select(
			"id, status, enrolled_at, completed_at, profiles(full_name, email), course_offerings(id, starts_at, modality, courses(id, title, slug))",
		)
		.order("enrolled_at", { ascending: false });
	if (offeringId) request = request.eq("offering_id", offeringId);

	const { data, error } = await request;
	if (error) {
		throw new Error(
			`No se pudieron cargar las inscripciones: ${error.message}`,
		);
	}
	const rows = data ?? [];

	return (
		<div>
			<AdminPageHeader
				title="Inscripciones"
				description={
					offeringId
						? "Edición seleccionada."
						: "Todas las ediciones de cursos."
				}
				action={
					offeringId ? (
						<Link href="/admin/cursos/inscripciones" className={buttonGhost}>
							Ver todas
						</Link>
					) : null
				}
			/>
			{query.error ? (
				<p
					className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
					role="alert"
				>
					{query.error === "full"
						? "No se puede confirmar: la edición alcanzó su cupo."
						: "No se pudo actualizar la inscripción."}
				</p>
			) : null}

			{rows.length === 0 ? (
				<EmptyState>No hay inscripciones para mostrar.</EmptyState>
			) : (
				<div className={tableWrap}>
					<table className={table}>
						<thead>
							<tr>
								<th className={th}>Fecha</th>
								<th className={th}>Participante</th>
								<th className={th}>Curso / edición</th>
								<th className={th}>Estado</th>
							</tr>
						</thead>
						<tbody>
							{rows.map((row) => {
								const profile = first(row.profiles);
								const offering = first(row.course_offerings);
								const course = first(offering?.courses ?? null);
								return (
									<tr key={row.id}>
										<td className={`${td} whitespace-nowrap`}>
											{formatDateTime(row.enrolled_at)}
										</td>
										<td className={td}>
											<div className="font-medium">
												{profile?.full_name || "Sin nombre"}
											</div>
											{profile?.email ? (
												<a
													className="text-primary hover:underline"
													href={`mailto:${profile.email}`}
												>
													{profile.email}
												</a>
											) : (
												"—"
											)}
										</td>
										<td className={td}>
											{course ? (
												<Link
													href={`/admin/cursos/${course.id}`}
													className="font-medium text-primary hover:underline"
												>
													{course.title}
												</Link>
											) : (
												"Curso no disponible"
											)}
											<div className="mt-1 text-xs text-muted-foreground">
												{formatDate(offering?.starts_at ?? null)} ·{" "}
												{MODALITY_LABELS[offering?.modality ?? ""] ??
													offering?.modality ??
													"—"}
											</div>
										</td>
										<td className={td}>
											<StatusSelect
												action={updateEnrollmentStatus}
												id={row.id}
												current={row.status}
												options={ENROLLMENT_STATUSES}
												optionLabels={ENROLLMENT_STATUS_LABELS}
											/>
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
