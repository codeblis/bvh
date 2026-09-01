"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { slugify } from "@/lib/utils";
import { COURSE_STATUSES, inList } from "../_status";

function text(formData: FormData, key: string) {
	return String(formData.get(key) ?? "").trim();
}

function num(formData: FormData, key: string) {
	const raw = text(formData, key);
	if (!raw) return null;
	const parsed = Number(raw);
	return Number.isNaN(parsed) ? null : parsed;
}

export async function saveCourse(formData: FormData) {
	const { supabase } = await requireAdmin();

	const id = text(formData, "id");
	const title = text(formData, "title");
	if (!title) return;

	const status = text(formData, "status");
	const payload = {
		title,
		slug: slugify(text(formData, "slug") || title),
		description: text(formData, "description") || null,
		content: text(formData, "content") || null,
		image: text(formData, "image") || null,
		instructor: text(formData, "instructor") || null,
		start_date: text(formData, "start_date") || null,
		end_date: text(formData, "end_date") || null,
		capacity: num(formData, "capacity"),
		price: num(formData, "price"),
		status: inList(COURSE_STATUSES, status) ? status : "activo",
	};

	if (id) {
		await supabase.from("courses").update(payload).eq("id", id);
	} else {
		await supabase.from("courses").insert(payload);
	}

	revalidatePath("/admin/cursos");
	revalidatePath("/admin");
	redirect("/admin/cursos");
}

export async function deleteCourse(formData: FormData) {
	const { supabase } = await requireAdmin();
	const id = text(formData, "id");
	if (id) await supabase.from("courses").delete().eq("id", id);
	revalidatePath("/admin/cursos");
	revalidatePath("/admin");
}
