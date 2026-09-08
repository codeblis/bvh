import { expect, test } from "vitest";
import { notificationIdempotencyKey } from "../src/modules/forms/idempotency.ts";

test("reutiliza la clave inicial si falta registrar el primer resultado", () => {
	expect(notificationIdempotencyKey("BVH-CON-ABC", "pending", 0)).toBe(
		"BVH-CON-ABC",
	);
});

test("mantiene estable la clave del reintento hasta guardar su resultado", () => {
	expect(notificationIdempotencyKey("BVH-CON-ABC", "failed", 1)).toBe(
		"BVH-CON-ABC-2",
	);
	expect(notificationIdempotencyKey("BVH-CON-ABC", "failed", 1)).toBe(
		"BVH-CON-ABC-2",
	);
});
