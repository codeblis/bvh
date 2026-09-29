"use server";

import { createClient } from "@/lib/supabase/server";
import {
	emailSchema,
	passwordUpdateSchema,
	registrationSchema,
} from "./schemas";
import { getAuthSiteOrigin } from "./site-url";

function callbackUrl(next: string) {
	const url = new URL("/auth/callback", getAuthSiteOrigin());
	url.searchParams.set("next", next);
	return url.toString();
}

export async function registerAccount(input: unknown) {
	const parsed = registrationSchema.safeParse(input);
	if (!parsed.success) return { error: parsed.error.issues[0].message };
	const { nombre, email, password, tipo, newsletter } = parsed.data;
	try {
		const supabase = await createClient();
		const { error } = await supabase.auth.signUp({
			email,
			password,
			options: {
				emailRedirectTo: callbackUrl("/cuenta"),
				// Only explicit profile fields; privileges never come from the payload.
				data: { nombre, tipo, newsletter },
			},
		});
		if (error && error.code !== "user_already_exists") {
			return { error: "No pudimos procesar el registro. Inténtalo más tarde." };
		}
		// Same response for a new or existing account; do not expose provider data.
		return { accepted: true };
	} catch {
		return { error: "No pudimos procesar el registro. Inténtalo más tarde." };
	}
}

export async function requestPasswordRecovery(input: unknown) {
	const parsed = emailSchema.safeParse(input);
	if (!parsed.success) return { error: "Introduce un email válido." };
	try {
		const supabase = await createClient();
		const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
			redirectTo: callbackUrl("/actualizar-password"),
		});
		if (error) console.warn("Password recovery provider request failed.");
	} catch {
		console.warn("Password recovery request unavailable.");
	}
	// Valid addresses always receive the same public answer, even on provider failure.
	return {
		message:
			"Si existe una cuenta con ese correo, recibirás instrucciones para continuar.",
	};
}

export async function updatePassword(input: unknown) {
	const parsed = passwordUpdateSchema.safeParse(input);
	if (!parsed.success) return { error: parsed.error.issues[0].message };
	try {
		const supabase = await createClient();
		const {
			data: { user },
			error: sessionError,
		} = await supabase.auth.getUser();
		if (sessionError || !user)
			return {
				error: "El enlace no es válido o ha caducado. Solicita uno nuevo.",
			};
		const { error } = await supabase.auth.updateUser({
			password: parsed.data.password,
		});
		if (error)
			return {
				error:
					"No pudimos actualizar la contraseña. Solicita un enlace nuevo e inténtalo otra vez.",
			};
		const { error: signOutError } = await supabase.auth.signOut({
			scope: "local",
		});
		if (signOutError)
			return {
				error:
					"Contraseña actualizada; no pudimos cerrar la sesión. Intenta cerrarla desde tu cuenta.",
			};
		return { updated: true };
	} catch {
		return {
			error: "No pudimos actualizar la contraseña. Inténtalo más tarde.",
		};
	}
}
