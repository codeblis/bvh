"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { CONTACT_STATUSES, inList } from "../_status";

export async function updateMessageStatus(formData: FormData) {
	const id = String(formData.get("id") ?? "");
	const status = String(formData.get("status") ?? "");
	if (
		!z.string().uuid().safeParse(id).success ||
		!inList(CONTACT_STATUSES, status)
	) {
		throw new Error("Estado o mensaje inválido");
	}

	const { supabase } = await requireAdmin();
	const { error } = await supabase
		.from("contact_messages")
		.update({ status })
		.eq("id", id);
	if (error)
		throw new Error(`No se pudo actualizar el mensaje: ${error.message}`);

	revalidatePath("/admin/mensajes");
	revalidatePath("/admin");
}
