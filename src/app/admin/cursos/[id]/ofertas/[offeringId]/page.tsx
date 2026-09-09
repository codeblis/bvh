import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import type { Tables } from "@/types/supabase";
import { buttonGhost, Field, SaveButton } from "../../../../_ui";
import { ConfirmSubmitButton } from "../../../../ConfirmSubmitButton";
import { closeCourseOffering, saveCourseOffering } from "../actions";

const OFFERING_STATUSES = [
	"borrador",
	"abierta",
	"cerrada",
	"cancelada",
	"finalizada",
] as const;
const MODALITIES = [
	"online",
	"presencial",
	"hibrido",
	"por_confirmar",
] as const;

function toDateTimeLocal(value: string | null | undefined, timeZone: string) {
	if (!value) return "";
	const parts = new Intl.DateTimeFormat("en-CA", {
		timeZone,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		hourCycle: "h23",
	})
		.formatToParts(new Date(value))
		.reduce<Record<string, string>>((result, part) => {
			result[part.type] = part.value;
			return result;
		}, {});

	return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

export default async function OfferingEditor({
	params,
	searchParams,
}: {
	params: Promise<{ id: string; offeringId: string }>;
	searchParams: Promise<{ error?: string; saved?: string }>;
}) {
	const { id: courseId, offeringId } = await params;
	const notices = await searchParams;
	const { supabase } = await requireAdmin();
	const isNew = offeringId === "nueva";

	const { data: course, error: courseError } = await supabase
		.from("courses")
		.select("id, title")
		.eq("id", courseId)
		.maybeSingle();
	if (courseError)
		throw new Error(`No se pudo cargar el curso: ${courseError.message}`);
	if (!course) notFound();

	let offering: Tables<"course_offerings"> | null = null;
	if (!isNew) {
		const { data, error } = await supabase
			.from("course_offerings")
			.select("*")
			.eq("id", offeringId)
			.eq("course_id", courseId)
			.maybeSingle();
		if (error)
			throw new Error(`No se pudo cargar la edición: ${error.message}`);
		if (!data) notFound();
		offering = data;
	}

	const timezone = offering?.timezone ?? "America/Havana";
	return (
		<div className="max-w-2xl">
			<Link
				href={`/admin/cursos/${course.id}`}
				className="text-xs text-muted-foreground hover:text-foreground"
			>
				← Volver a {course.title}
			</Link>
			<h1 className="mt-2 font-serif text-2xl">
				{isNew ? "Nueva edición" : "Editar edición"}
			</h1>
			<p className="mt-1 mb-6 text-sm text-muted-foreground">{course.title}</p>

			{notices.saved ? (
				<p
					className="mb-4 rounded-md border border-primary/40 bg-primary/10 px-4 py-3 text-sm"
					role="status"
				>
					Edición guardada.
				</p>
			) : null}
			{notices.error ? (
				<p
					className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
					role="alert"
				>
					{notices.error === "capacity"
						? "El cupo no puede quedar por debajo de las inscripciones confirmadas."
						: notices.error === "invalid"
							? "Revisa fechas, modalidad, ubicación, precio y cupo."
							: "No se pudo completar la operación."}
				</p>
			) : null}

			<form action={saveCourseOffering} className="space-y-4">
				<input type="hidden" name="course_id" value={course.id} />
				{offering ? (
					<input type="hidden" name="offering_id" value={offering.id} />
				) : null}
				<div className="grid gap-4 sm:grid-cols-2">
					<Field
						label="Inicio"
						name="starts_at"
						type="datetime-local"
						defaultValue={toDateTimeLocal(offering?.starts_at, timezone)}
					/>
					<Field
						label="Fin"
						name="ends_at"
						type="datetime-local"
						defaultValue={toDateTimeLocal(offering?.ends_at, timezone)}
					/>
					<Field
						label="Zona horaria"
						name="timezone"
						defaultValue={timezone}
						required
					/>
					<Field
						label="Modalidad"
						name="modality"
						defaultValue={offering?.modality ?? "por_confirmar"}
						options={MODALITIES}
					/>
					<Field
						label="Ubicación pública"
						name="location"
						defaultValue={offering?.location}
						hint="Obligatoria para presencial o híbrido. No publiques enlaces privados de clase."
					/>
					<Field
						label="Plazas"
						name="capacity"
						type="number"
						defaultValue={offering?.capacity}
					/>
					<Field
						label="Precio"
						name="price"
						type="number"
						step="0.01"
						defaultValue={offering?.price}
					/>
					<Field
						label="Moneda"
						name="currency"
						defaultValue={offering?.currency ?? "USD"}
						required
					/>
				</div>
				<Field
					label="Estado"
					name="offering_status"
					defaultValue={offering?.status ?? "borrador"}
					options={OFFERING_STATUSES}
				/>
				<div className="flex flex-wrap gap-3">
					<SaveButton />
					{offering ? (
						<Link
							href={`/admin/cursos/inscripciones?offering=${offering.id}`}
							className={buttonGhost}
						>
							Ver inscripciones
						</Link>
					) : null}
				</div>
			</form>

			{offering && offering.status === "abierta" ? (
				<form
					action={closeCourseOffering}
					className="mt-8 border-t border-border pt-6"
				>
					<input type="hidden" name="course_id" value={course.id} />
					<input type="hidden" name="offering_id" value={offering.id} />
					<ConfirmSubmitButton
						message="Cerrar esta edición impedirá nuevas inscripciones. Las existentes se conservarán."
						className="text-sm text-destructive hover:underline"
					>
						Cerrar inscripciones para esta edición
					</ConfirmSubmitButton>
				</form>
			) : null}
		</div>
	);
}
