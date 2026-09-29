import { NextResponse } from "next/server";

export function invalidRequest() {
	return NextResponse.json(
		{ ok: false, message: "Revisa los datos e inténtalo nuevamente." },
		{ status: 400 },
	);
}

export function persistenceUnavailable() {
	return NextResponse.json(
		{
			ok: false,
			message:
				"No pudimos registrar la solicitud. Inténtalo nuevamente en unos minutos.",
		},
		{ status: 503 },
	);
}

export function tooManyRequests() {
	return NextResponse.json(
		{
			ok: false,
			message:
				"Recibimos varios envíos desde tu conexión. Espera unos minutos e inténtalo otra vez.",
		},
		{ status: 429 },
	);
}

export function verificationRequired() {
	return NextResponse.json(
		{
			ok: false,
			message:
				"No pudimos verificar que eres una persona. Vuelve a intentarlo.",
		},
		{ status: 403 },
	);
}
