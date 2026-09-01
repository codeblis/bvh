"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { slugify } from "@/lib/utils";
import { COMPANY_STATUSES, inList } from "../_status";

function text(formData: FormData, key: string) {
	return String(formData.get(key) ?? "").trim();
}

export async function saveCompany(formData: FormData) {
	const { supabase } = await requireAdmin();

	const id = text(formData, "id");
	const name = text(formData, "name");
	if (!name) return;

	const status = text(formData, "status");
	const payload = {
		name,
		slug: slugify(text(formData, "slug") || name),
		description: text(formData, "description") || null,
		logo_url: text(formData, "logo_url") || null,
		sector: text(formData, "sector") || null,
		website: text(formData, "website") || null,
		status: inList(COMPANY_STATUSES, status) ? status : "interesada",
	};

	if (id) {
		await supabase.from("companies").update(payload).eq("id", id);
	} else {
		await supabase.from("companies").insert(payload);
	}

	revalidatePath("/admin/empresas");
	redirect("/admin/empresas");
}

export async function deleteCompany(formData: FormData) {
	const { supabase } = await requireAdmin();
	const id = text(formData, "id");
	if (id) await supabase.from("companies").delete().eq("id", id);
	revalidatePath("/admin/empresas");
}
