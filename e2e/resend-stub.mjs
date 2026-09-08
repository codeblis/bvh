// Proveedor de correo sintético para E2E. No envía nada: registra la clave
// idempotente de cada intento y responde según el modo pedido por la prueba.
// Escucha solo en 127.0.0.1 y no acepta credenciales reales.
import { randomUUID } from "node:crypto";
import { createServer } from "node:http";

const port = Number(process.env.RESEND_STUB_PORT ?? 3101);
const modes = new Set(["reject", "accept", "drop"]);
let mode = "reject";
let attempts = [];

function readBody(request) {
	return new Promise((resolve, reject) => {
		let raw = "";
		request.on("data", (chunk) => {
			raw += chunk;
			if (raw.length > 1_000_000) reject(new Error("stub body too large"));
		});
		request.on("end", () => resolve(raw));
		request.on("error", reject);
	});
}

function json(response, status, payload) {
	const body = JSON.stringify(payload);
	response.writeHead(status, {
		"Content-Type": "application/json",
		"Content-Length": Buffer.byteLength(body),
	});
	response.end(body);
}

const server = createServer(async (request, response) => {
	const url = new URL(request.url ?? "/", `http://127.0.0.1:${port}`);

	if (url.pathname === "/__stub") {
		if (request.method === "GET")
			return json(response, 200, { mode, attempts });
		if (request.method === "POST") {
			const parsed = JSON.parse((await readBody(request)) || "{}");
			if (parsed.mode && !modes.has(parsed.mode)) {
				return json(response, 400, { error: "unknown mode" });
			}
			if (parsed.mode) mode = parsed.mode;
			if (parsed.reset) attempts = [];
			return json(response, 200, { mode, attempts });
		}
		return json(response, 405, { error: "method not allowed" });
	}

	if (url.pathname === "/emails" && request.method === "POST") {
		const parsed = JSON.parse((await readBody(request)) || "{}");
		attempts.push({
			idempotencyKey: request.headers["idempotency-key"] ?? null,
			subject: parsed.subject ?? null,
			to: parsed.to ?? null,
		});
		if (mode === "drop") return request.socket.destroy();
		if (mode === "accept") return json(response, 200, { id: randomUUID() });
		return json(response, 422, {
			name: "validation_error",
			message: "Rechazo sintético del proveedor local",
		});
	}

	return json(response, 404, { error: "not found" });
});

server.listen(port, "127.0.0.1", () => {
	process.stdout.write(`resend stub listening on 127.0.0.1:${port}\n`);
});
