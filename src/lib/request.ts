export async function readBoundedJson(
	request: Request,
	maxBytes = 32 * 1024,
): Promise<unknown | null> {
	const mediaType = request.headers
		.get("content-type")
		?.split(";", 1)[0]
		.trim()
		.toLowerCase();
	if (mediaType !== "application/json") return null;

	const declaredLength = Number.parseInt(
		request.headers.get("content-length") ?? "0",
		10,
	);
	if (Number.isFinite(declaredLength) && declaredLength > maxBytes) return null;
	if (!request.body) return null;

	const reader = request.body.getReader();
	const chunks: Uint8Array[] = [];
	let total = 0;
	while (true) {
		const { done, value } = await reader.read();
		if (done) break;
		total += value.byteLength;
		if (total > maxBytes) {
			await reader.cancel();
			return null;
		}
		chunks.push(value);
	}

	const body = new Uint8Array(total);
	let offset = 0;
	for (const chunk of chunks) {
		body.set(chunk, offset);
		offset += chunk.byteLength;
	}

	try {
		return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(body));
	} catch {
		return null;
	}
}

// Identifica al cliente para limitar envíos sin guardar su dirección: se
// deriva un hash y solo viaja ese. En Cloudflare la cabecera fiable es
// `CF-Connecting-IP`; el resto son sugerencias del cliente.
export async function clientFingerprint(request: Request): Promise<string> {
	const address =
		request.headers.get("cf-connecting-ip") ??
		request.headers.get("x-real-ip") ??
		request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
		"desconocido";
	const salt = process.env.RATE_LIMIT_SALT ?? "bvh";
	const digest = await crypto.subtle.digest(
		"SHA-256",
		new TextEncoder().encode(`${salt}:${address}`),
	);
	return Array.from(new Uint8Array(digest))
		.map((byte) => byte.toString(16).padStart(2, "0"))
		.join("")
		.slice(0, 32);
}
