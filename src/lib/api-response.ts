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
