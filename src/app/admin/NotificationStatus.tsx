import { retryFormNotification } from "./notificaciones/actions";

const labels: Record<string, string> = {
	unknown: "Histórico",
	pending: "Pendiente",
	sent: "Enviado",
	failed: "Falló",
};

export function NotificationStatus({
	resourceType,
	id,
	status,
	attempts,
}: {
	resourceType:
		| "contact_message"
		| "company_application"
		| "newsletter_subscription";
	id: string;
	status: string;
	attempts: number;
}) {
	const sent = status === "sent";
	return (
		<div className="space-y-1 whitespace-nowrap text-xs">
			<div
				className={
					sent
						? "text-emerald-400"
						: status === "failed"
							? "text-destructive"
							: "text-amber-300"
				}
			>
				{labels[status] ?? status} · {attempts} intento(s)
			</div>
			{!sent ? (
				<form action={retryFormNotification}>
					<input type="hidden" name="id" value={id} />
					<input type="hidden" name="resource_type" value={resourceType} />
					<button type="submit" className="text-primary hover:underline">
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
			className={`mb-5 rounded-md border px-4 py-3 text-sm ${success ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" : "border-destructive/40 bg-destructive/10 text-destructive"}`}
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
