import { Flag, type FlagTone } from "./_ui";
import { retryFormNotification } from "./notificaciones/actions";

const labels: Record<string, { text: string; tone: FlagTone }> = {
	unknown: { text: "Histórico", tone: "neutro" },
	pending: { text: "Pendiente", tone: "espera" },
	sent: { text: "Enviado", tone: "hecho" },
	failed: { text: "Falló", tone: "fallo" },
};

function attemptsLabel(attempts: number) {
	if (attempts === 0) return "sin intentos";
	return attempts === 1 ? "1 intento" : `${attempts} intentos`;
}

export function NotificationStatus({
	resourceType,
	id,
	status,
	attempts,
}: {
	resourceType:
		| "contact_message"
		| "company_application"
		| "newsletter_subscription"
		| "course_enrollment";
	id: string;
	status: string;
	attempts: number;
}) {
	const sent = status === "sent";
	const flag = labels[status] ?? { text: status, tone: "neutro" as FlagTone };

	return (
		<div className="space-y-1.5 whitespace-nowrap">
			<Flag tone={flag.tone}>{flag.text}</Flag>
			<div className="text-[11px] text-muted-foreground">
				{attemptsLabel(attempts)}
			</div>
			{!sent ? (
				<form action={retryFormNotification}>
					<input type="hidden" name="id" value={id} />
					<input type="hidden" name="resource_type" value={resourceType} />
					<button
						type="submit"
						className="rounded-md text-xs text-primary transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
					>
						Reintentar aviso
					</button>
				</form>
			) : null}
		</div>
	);
}

export function NotificationResultBanner({
	result,
	error,
}: {
	result?: string;
	error?: string;
}) {
	if (!result && !error) return null;
	const success = result === "sent";
	return (
		<p
			className={`mb-5 rounded-lg border px-4 py-3 text-sm ${success ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" : "border-destructive/40 bg-destructive/10 text-destructive"}`}
			role={success ? "status" : "alert"}
		>
			{success
				? "Aviso enviado correctamente."
				: error === "not-found"
					? "El registro ya no existe."
					: error === "notification-state"
						? "El proveedor respondió, pero no pudo guardarse el resultado. Reintentar conserva la misma clave lógica."
						: "El aviso no pudo enviarse. Quedó registrado para otro reintento."}
		</p>
	);
}
