import { expect, test } from "vitest";
import { csvFilename, neutralizeCell, toCsv } from "../src/lib/csv";

test("un valor que empieza por fórmula se marca como texto", () => {
	for (const dangerous of [
		"=1+1",
		"+34600000000",
		"-1",
		"@SUM(A1)",
		"\tvalor",
		"\rvalor",
	]) {
		expect(neutralizeCell(dangerous)).toBe(`'${dangerous}`);
	}
});

test("el ataque clásico de ejecución no viaja como fórmula", () => {
	const attack = "=cmd|' /C calc'!A0";
	const csv = toCsv(["nombre"], [[attack]]);
	const cell = csv.replace("\ufeff", "").trimEnd().split("\r\n")[1];
	// El contenido se conserva íntegro, pero ninguna celda empieza por «=».
	expect(cell).toBe(`'${attack}`);
	expect(csv).not.toMatch(/(^|,|\n)=/);
});

test("un valor corriente no se altera", () => {
	expect(neutralizeCell("Persona de prueba")).toBe("Persona de prueba");
	expect(neutralizeCell("persona@example.test")).toBe("persona@example.test");
	expect(neutralizeCell(42)).toBe("42");
	expect(neutralizeCell(null)).toBe("");
	expect(neutralizeCell(undefined)).toBe("");
});

test("comillas, comas y saltos de línea se escapan sin perder contenido", () => {
	const csv = toCsv(
		["campo"],
		[['dijo "hola", y se fue'], ["primera\nsegunda"]],
	);
	expect(csv).toContain('"dijo ""hola"", y se fue"');
	expect(csv).toContain('"primera\nsegunda"');
});

test("la cabecera también se neutraliza y las filas conservan su orden", () => {
	const csv = toCsv(
		["=nombre", "correo"],
		[
			["Ana", "ana@example.test"],
			["Beto", "beto@example.test"],
		],
	);
	const lines = csv.replace("﻿", "").trimEnd().split("\r\n");
	expect(lines[0]).toBe("'=nombre,correo");
	expect(lines[1]).toBe("Ana,ana@example.test");
	expect(lines[2]).toBe("Beto,beto@example.test");
});

test("el archivo empieza con BOM para que la hoja lea los acentos", () => {
	expect(toCsv(["categoría"], [["Educación"]]).startsWith("﻿")).toBe(true);
});

test("el nombre del archivo lleva la fecha del día", () => {
	expect(csvFilename("newsletter", new Date("2026-09-09T12:00:00Z"))).toBe(
		"newsletter-2026-09-09.csv",
	);
});
