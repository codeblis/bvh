// Una hoja de cálculo interpreta como fórmula cualquier celda que empiece por
// =, +, - o @ (y por tabulador o retorno de carro). Un dato exportado nunca
// debe ejecutarse al abrirlo, así que se antepone una comilla simple, que las
// hojas muestran como texto plano.
const FORMULA_START = /^[=+\-@\t\r]/;

export function neutralizeCell(value: unknown): string {
	if (value === null || value === undefined) return "";
	const text = typeof value === "string" ? value : String(value);
	return FORMULA_START.test(text) ? `'${text}` : text;
}

function quote(value: string) {
	return /[",\n\r]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
}

export function toCsv(
	headers: readonly string[],
	rows: readonly (readonly unknown[])[],
): string {
	const lines = [
		headers.map((header) => quote(neutralizeCell(header))).join(","),
		...rows.map((row) =>
			row.map((cell) => quote(neutralizeCell(cell))).join(","),
		),
	];
	// CRLF y BOM: es lo que abre bien una hoja de cálculo con acentos.
	return `﻿${lines.join("\r\n")}\r\n`;
}

export function csvFilename(prefix: string, now = new Date()) {
	return `${prefix}-${now.toISOString().slice(0, 10)}.csv`;
}
