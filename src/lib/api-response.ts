import { NextResponse } from "next/server";

export function invalidRequest() {
	return NextResponse.json(
		{ ok: false, message: "Revisa los datos e inténtalo nuevamente." },
		{ status: 400 },
	);
}

export function integrationUnavailable() {
	return NextResponse.json(
		{
			ok: false,
			message:
				"El envío todavía no está habilitado. Escríbenos directamente por correo.",
		},
		{ status: 503 },
	);
}
