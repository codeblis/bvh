"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";

function text(formData: FormData, key: string) {
	return String(formData.get(key) ?? "").trim();
}

function num(formData: FormData, key: string) {
	const raw = text(formData, key);
	if (!raw) return null;
	const parsed = Number(raw);
	return Number.isNaN(parsed) ? null : parsed;
}

export async function saveIndex(formData: FormData) {
	const { supabase } = await requireAdmin();

	const id = text(formData, "id");
	const name = text(formData, "name");
	const value = num(formData, "value");
	if (!name || value == null) return;

	const payload = {
		name,
		value,
		change: num(formData, "change"),
		change_percent: num(formData, "change_percent"),
		last_updated: new Date().toISOString(),
	};

	if (id) {
		await supabase.from("indices").update(payload).eq("id", id);
	} else {
		await supabase.from("indices").insert(payload);
	}

	revalidatePath("/admin/indices");
}

export async function deleteIndex(formData: FormData) {
	const { supabase } = await requireAdmin();
	const id = text(formData, "id");
	if (id) await supabase.from("indices").delete().eq("id", id);
	revalidatePath("/admin/indices");
}
