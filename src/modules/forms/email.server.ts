import "server-only";

import type { CreateEmailOptions } from "resend";
import { getResendClient } from "@/lib/resend";

export type EmailDeliveryResult =
	| { success: true; providerId: string | null }
	| { success: false; error: string };

export async function deliverEmail(
	message: CreateEmailOptions,
	idempotencyKey: string,
): Promise<EmailDeliveryResult> {
	const resend = getResendClient();
	if (!resend) return { success: false, error: "resend_not_configured" };

	try {
		const { data, error } = await resend.emails.send(message, {
			idempotencyKey,
		});
		if (error) {
			return {
				success: false,
				error: error.message.slice(0, 500),
			};
		}
		return { success: true, providerId: data?.id ?? null };
	} catch (error) {
		return {
			success: false,
			error:
				error instanceof Error
					? error.message.slice(0, 500)
					: "email_provider_error",
		};
	}
}
