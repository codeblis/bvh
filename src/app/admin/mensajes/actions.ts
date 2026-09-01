"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { CONTACT_STATUSES, inList } from "../_status";

export async function updateMessageStatus(formData: FormData) {
	const id = String(formData.get("id") ?? "");
	const status = String(formData.get("status") ?? "");
	if (!id || !inList(CONTACT_STATUSES, status)) return;

	const { supabase } = await requireAdmin();
	await supabase.from("contact_messages").update({ status }).eq("id", id);

	revalidatePath("/admin/mensajes");
	revalidatePath("/admin");
}
