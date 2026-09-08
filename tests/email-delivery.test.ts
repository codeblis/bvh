import { beforeEach, expect, test, vi } from "vitest";
import { deliverEmail } from "../src/modules/forms/email.server";

const { send, client } = vi.hoisted(() => ({ send: vi.fn(), client: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/resend", () => ({ getResendClient: client }));

const message = {
	from: "bvh@example.test",
	to: "operator@example.test",
	subject: "Synthetic notification",
	html: "<p>Local test only</p>",
};

beforeEach(() => {
	vi.resetAllMocks();
	client.mockReturnValue({ emails: { send } });
});

test("sin proveedor configurado no se intenta correo", async () => {
	client.mockReturnValue(null);
	expect(await deliverEmail(message, "synthetic-reference")).toEqual({
		success: false,
		error: "resend_not_configured",
	});
	expect(send).not.toHaveBeenCalled();
});

test("el adaptador transmite la clave lógica y conserva el identificador aceptado", async () => {
	send.mockResolvedValue({
		data: { id: "synthetic-provider-id" },
		error: null,
	});
	expect(await deliverEmail(message, "synthetic-reference")).toEqual({
		success: true,
		providerId: "synthetic-provider-id",
	});
	expect(send).toHaveBeenCalledWith(message, {
		idempotencyKey: "synthetic-reference",
	});
});

test("el rechazo del proveedor no se presenta como aceptación", async () => {
	send.mockResolvedValue({
		data: null,
		error: { name: "validation_error", message: "Synthetic rejection" },
	});
	expect(await deliverEmail(message, "synthetic-reference")).toMatchObject({
		success: false,
	});
});

test("aceptación seguida de corte de conexión queda sin confirmación local", async () => {
	const accepted = new Set<string>();
	send.mockImplementation(
		async (_message, options: { idempotencyKey: string }) => {
			accepted.add(options.idempotencyKey);
			throw new Error("Synthetic connection lost after provider acceptance");
		},
	);
	const result = await deliverEmail(message, "synthetic-reference");
	expect(accepted.size).toBe(1);
	expect(result).toMatchObject({ success: false });
	// This verifies the uncertain provider boundary only. Durable retry behavior
	// remains an explicit blocker of OpenSpec task 3.5, not proven by this test.
});
