const AUTH_DESTINATIONS = [
	"/cuenta",
	"/admin",
	"/actualizar-password",
	"/instituto/cursos",
] as const;

export function getSafeAuthRedirect(
	value: string | null | undefined,
	fallback = "/cuenta",
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
	const destination = AUTH_DESTINATIONS.find(
		(prefix) => path === prefix || path.startsWith(`${prefix}/`),
	);

	// Keep the original query encoding rather than decoding nested query values.
	const original = new URL(value, "https://auth.invalid");
	return destination ? `${path}${original.search}` : fallback;
}
