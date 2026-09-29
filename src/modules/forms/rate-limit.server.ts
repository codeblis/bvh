import "server-only";

import type { createServiceClient } from "@/lib/supabase/service";

const DEFAULT_LIMIT = 5;
const DEFAULT_WINDOW_SECONDS = 300;

function positiveInt(value: string | undefined, fallback: number) {
	const parsed = Number.parseInt(value ?? "", 10);
	return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function rateLimitSettings() {
	return {
		limit: positiveInt(process.env.FORMS_RATE_LIMIT, DEFAULT_LIMIT),
		windowSeconds: positiveInt(
			process.env.FORMS_RATE_LIMIT_WINDOW,
			DEFAULT_WINDOW_SECONDS,
		),
	};
}

/**
 * Cuenta un intento y responde si el cliente sigue dentro del límite.
 *
 * Si la comprobación falla —la base no responde, por ejemplo— se deja pasar:
 * un formulario que deja de aceptar solicitudes legítimas porque el contador
 * está caído hace más daño que el abuso que evita. La barrera dura de la
 * persistencia y la validación sigue puesta.
 */
export async function withinRateLimit(
	supabase: ReturnType<typeof createServiceClient>,
	fingerprint: string,
	route: string,
): Promise<boolean> {
	const { limit, windowSeconds } = rateLimitSettings();
	const { data, error } = await supabase.rpc("check_form_rate_limit", {
		p_bucket: `${route}:${fingerprint}`,
		p_limit: limit,
		p_window_seconds: windowSeconds,
	});
	if (error) return true;
	return data !== false;
}
