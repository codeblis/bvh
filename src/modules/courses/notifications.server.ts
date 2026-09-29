import "server-only";

import type { CreateEmailOptions } from "resend";
import { escapeHtml } from "@/lib/forms";
import { emailConfig } from "@/lib/resend";

const MODALITY_TEXT: Record<string, string> = {
	online: "En línea",
	presencial: "Presencial",
	hibrido: "Híbrida",
	por_confirmar: "Por confirmar",
};

export type EnrollmentEmailData = {
	reference: string;
	studentEmail: string;
	studentName: string | null;
	courseTitle: string;
	startsAt: string | null;
	modality: string | null;
	location: string | null;
};

function formatStart(startsAt: string | null) {
	if (!startsAt) return "Por confirmar";
	const date = new Date(startsAt);
	if (Number.isNaN(date.getTime())) return "Por confirmar";
	return new Intl.DateTimeFormat("es-CU", {
		dateStyle: "long",
		timeStyle: "short",
		timeZone: "America/Havana",
	}).format(date);
}

// El correo confirma algo que ya ocurrió en la base: el alumno está inscrito
// aunque este mensaje nunca salga. Por eso no lleva ninguna acción obligatoria.
export function enrollmentConfirmationEmail(
	data: EnrollmentEmailData,
): CreateEmailOptions {
	const greeting = data.studentName
		? `Hola ${escapeHtml(data.studentName)},`
		: "Hola,";
	const rows = [
		["Curso", data.courseTitle],
		["Inicio", formatStart(data.startsAt)],
		["Modalidad", MODALITY_TEXT[data.modality ?? ""] ?? "Por confirmar"],
		...(data.location ? [["Lugar", data.location] as const] : []),
		["Referencia", data.reference],
	]
		.map(
			([label, value]) =>
				`<p><strong>${escapeHtml(String(label))}:</strong> ${escapeHtml(String(value))}</p>`,
		)
		.join("");

	return {
		from: emailConfig.from,
		to: data.studentEmail,
		replyTo: emailConfig.to,
		subject: `[${data.reference}] Inscripción confirmada · ${data.courseTitle}`,
		html: `<h1>Tu plaza está confirmada</h1><p>${greeting}</p><p>Hemos registrado tu inscripción en el Instituto BVH.</p>${rows}<p>Si necesitas cancelar o cambiar de edición, responde a este correo.</p>`,
	};
}
