import "server-only";

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const TIMEOUT_MS = 5000;

export type TurnstileResult =
	| { ok: true }
	| { ok: false; reason: "missing" | "rejected" | "unavailable" };

export function isTurnstileEnabled() {
	return Boolean(process.env.TURNSTILE_SECRET_KEY);
}

/**
 * Verifica el token del widget contra Cloudflare.
 *
 * Si el verificador no responde a tiempo, la respuesta es `unavailable` y el
 * formulario **rechaza** el envío pidiendo reintentar. Aceptar a ciegas
 * convertiría una caída del verificador en una puerta abierta, que es
 * exactamente lo que esta protección debe evitar.
 */
export async function verifyTurnstile(
	token: string | undefined,
	fingerprint?: string,
): Promise<TurnstileResult> {
	const secret = process.env.TURNSTILE_SECRET_KEY;
	if (!secret) return { ok: true };
	if (!token) return { ok: false, reason: "missing" };

	const body = new URLSearchParams({ secret, response: token });
	if (fingerprint) body.set("idempotency_key", fingerprint);

	try {
		const response = await fetch(
			process.env.TURNSTILE_VERIFY_URL ?? VERIFY_URL,
			{
				method: "POST",
				headers: { "Content-Type": "application/x-www-form-urlencoded" },
				body,
				signal: AbortSignal.timeout(TIMEOUT_MS),
			},
		);
		if (!response.ok) return { ok: false, reason: "unavailable" };
		const result = (await response.json()) as { success?: boolean };
		return result.success === true
			? { ok: true }
			: { ok: false, reason: "rejected" };
	} catch {
		return { ok: false, reason: "unavailable" };
	}
}
