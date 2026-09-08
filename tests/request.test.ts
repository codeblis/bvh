import { expect, test } from "vitest";
import { readBoundedJson } from "../src/lib/request.ts";

test("lee JSON dentro del límite", async () => {
	const request = new Request("https://example.test/api", {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify({ ok: true }),
	});
	expect(await readBoundedJson(request, 100)).toEqual({ ok: true });
});

test("rechaza tipo, JSON inválido y cuerpo grande", async () => {
	const wrongType = new Request("https://example.test/api", {
		method: "POST",
		body: "{}",
	});
	const malformed = new Request("https://example.test/api", {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: "{",
	});
	const oversized = new Request("https://example.test/api", {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify({ value: "x".repeat(100) }),
	});

	expect(await readBoundedJson(wrongType, 100)).toBeNull();
	expect(await readBoundedJson(malformed, 100)).toBeNull();
	expect(await readBoundedJson(oversized, 20)).toBeNull();
});

test("compara el media type completo y admite parámetros JSON", async () => {
	for (const type of [
		"application/json-extra",
		"text/application/json",
		"text/plain; note=application/json",
	]) {
		expect(
			await readBoundedJson(
				new Request("https://example.test/api", {
					method: "POST",
					headers: { "content-type": type },
					body: "{}",
				}),
			),
		).toBeNull();
	}
	expect(
		await readBoundedJson(
			new Request("https://example.test/api", {
				method: "POST",
				headers: { "content-type": "Application/JSON; charset=utf-8" },
				body: "{}",
			}),
		),
	).toEqual({});
});

test("rechaza UTF-8 inválido sin convertirlo silenciosamente", async () => {
	const bytes = new Uint8Array([123, 34, 120, 34, 58, 34, 255, 34, 125]);
	expect(
		await readBoundedJson(
			new Request("https://example.test/api", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: bytes,
			}),
		),
	).toBeNull();
});
