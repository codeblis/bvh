import { Resend } from "resend";

export function getResendClient() {
	const apiKey = process.env.RESEND_API_KEY;
	if (!apiKey) return null;
	return new Resend(apiKey);
}

export const emailConfig = {
	from: process.env.EMAIL_FROM ?? "BVH <onboarding@resend.dev>",
	to: process.env.EMAIL_TO ?? "contacto@bolsadelahabana.com",
};
