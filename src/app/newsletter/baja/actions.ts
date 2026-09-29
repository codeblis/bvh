"use server";

import { redirect } from "next/navigation";
import { unsubscribeSchema } from "@/lib/forms";
import { createServiceClient } from "@/lib/supabase/service";

export async function unsubscribeNewsletter(formData: FormData) {
	const parsed = unsubscribeSchema.safeParse({
		token: String(formData.get("token") ?? ""),
	});
	if (!parsed.success) redirect("/newsletter/baja?result=invalid");

	let supabase: ReturnType<typeof createServiceClient>;
	try {
		supabase = createServiceClient();
	} catch {
		redirect("/newsletter/baja?result=unavailable");
	}
	const { data, error } = await supabase.rpc("unsubscribe_newsletter", {
		p_token: parsed.data.token,
	});
	if (error) redirect("/newsletter/baja?result=unavailable");
	redirect(`/newsletter/baja?result=${data ? "success" : "inactive"}`);
}

// Baja de todo, desde el mismo enlace: quien ya no quiere saber nada no
// debería tener que buscar el token de cada lista.
export async function unsubscribeAllNewsletters(formData: FormData) {
	const parsed = unsubscribeSchema.safeParse({
		token: String(formData.get("token") ?? ""),
	});
	if (!parsed.success) redirect("/newsletter/baja?result=invalid");

	let supabase: ReturnType<typeof createServiceClient>;
	try {
		supabase = createServiceClient();
	} catch {
		redirect("/newsletter/baja?result=unavailable");
	}
	const { data, error } = await supabase.rpc("unsubscribe_newsletter_all", {
		p_token: parsed.data.token,
	});
	if (error) redirect("/newsletter/baja?result=unavailable");
	redirect(`/newsletter/baja?result=${data ? "success-all" : "inactive"}`);
}
