"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { APPLICATION_STATUSES, inList } from "../_status";

export async function updateApplicationStatus(formData: FormData) {
	const id = String(formData.get("id") ?? "");
	const status = String(formData.get("status") ?? "");
	if (!id || !inList(APPLICATION_STATUSES, status)) return;

	const { supabase } = await requireAdmin();
	await supabase.from("company_applications").update({ status }).eq("id", id);

	revalidatePath("/admin/solicitudes");
	revalidatePath("/admin");
}
