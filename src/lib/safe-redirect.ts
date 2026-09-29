import { isEditorialScope } from "./scope";

const AUTH_DESTINATIONS = [
	"/cuenta",
	"/admin",
	"/actualizar-password",
	"/instituto/cursos",
] as const;

/**
 * En el MVP editorial `/cuenta` responde 404 y las únicas cuentas son las de
 * quien publica, así que el destino natural tras entrar es el panel. Con el
 * sitio completo vuelve a ser el área personal, que es de quien se inscribe a
 * un curso.
 *
 * Se resuelve al llamar y no al cargar el módulo: así no depende del orden de
 * importación, que es justo lo que rompe al probarlo.
 */
export function defaultAuthDestination() {
	return isEditorialScope() ? "/admin" : "/cuenta";
}

export function getSafeAuthRedirect(
	value: string | null | undefined,
	fallback = defaultAuthDestination(),
) {
	if (!value || value !== value.trim() || !value.startsWith("/"))
		return fallback;

	let decoded: string;
	try {
		decoded = decodeURIComponent(value);
	} catch {
		return fallback;
	}

	if (
		decoded.startsWith("//") ||
		decoded.includes("\\") ||
		Array.from(decoded).some((character) => {
			const code = character.charCodeAt(0);
			return code <= 31 || code === 127;
		})
	) {
		return fallback;
	}

	const parsed = new URL(decoded, "https://auth.invalid");
	// Normalize dot segments before checking the allowlist; reject nested escapes.
	if (parsed.origin !== "https://auth.invalid" || parsed.pathname.includes("%"))
		return fallback;
	const path = parsed.pathname;
	const allowed = isEditorialScope()
		? AUTH_DESTINATIONS.filter((prefix) => prefix === "/admin")
		: AUTH_DESTINATIONS;
	const destination = allowed.find(
		(prefix) => path === prefix || path.startsWith(`${prefix}/`),
	);

	// Keep the original query encoding rather than decoding nested query values.
	const original = new URL(value, "https://auth.invalid");
	return destination ? `${path}${original.search}` : fallback;
}
