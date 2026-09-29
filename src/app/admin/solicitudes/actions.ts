"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { APPLICATION_STATUSES, inList } from "../_status";

export async function updateApplicationStatus(formData: FormData) {
	const id = String(formData.get("id") ?? "");
	const status = String(formData.get("status") ?? "");
	if (
		!z.string().uuid().safeParse(id).success ||
		!inList(APPLICATION_STATUSES, status)
	) {
		throw new Error("Estado o solicitud inválida");
	}

	const { supabase } = await requireAdmin();
	const { error } = await supabase
		.from("company_applications")
		.update({ status })
		.eq("id", id);
	if (error)
		throw new Error(`No se pudo actualizar la solicitud: ${error.message}`);

	revalidatePath("/admin/solicitudes");
	revalidatePath("/admin");
}
