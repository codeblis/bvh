"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { slugify } from "@/lib/utils";

const categorySchema = z.object({
	id: z.union([z.string().uuid(), z.literal("")]).optional(),
	name: z.string().trim().min(2).max(80),
	slug: z.string().trim().max(80),
	description: z
		.string()
		.trim()
		.max(500)
		.transform((value) => value || null),
});

function text(formData: FormData, key: string) {
	return String(formData.get(key) ?? "").trim();
}

function revalidateCategories() {
	revalidatePath("/admin/categorias");
	revalidatePath("/admin/articulos");
	revalidatePath("/noticias");
	revalidatePath("/blog");
}

export async function saveCategory(formData: FormData) {
	const { supabase } = await requireAdmin();
	const parsed = categorySchema.safeParse({
		id: text(formData, "id"),
		name: text(formData, "name"),
		slug: text(formData, "slug"),
		description: text(formData, "description"),
	});
	if (!parsed.success) redirect("/admin/categorias?error=invalid");

	const { id, name, slug, description } = parsed.data;
	const payload = { name, slug: slugify(slug || name), description };
	if (!payload.slug) redirect("/admin/categorias?error=invalid");

	const result = id
		? await supabase
				.from("categories")
				.update(payload)
				.eq("id", id)
				.select("id")
				.maybeSingle()
		: await supabase.from("categories").insert(payload).select("id").single();

	if (result.error) {
		const reason = result.error.code === "23505" ? "duplicate" : "save";
		redirect(`/admin/categorias?error=${reason}`);
	}
	if (!result.data) redirect("/admin/categorias?error=not-found");

	revalidateCategories();
	redirect(`/admin/categorias?saved=${id ? "updated" : "created"}`);
}

export async function deleteCategory(formData: FormData) {
	const { supabase } = await requireAdmin();
	const id = text(formData, "id");
	if (!z.string().uuid().safeParse(id).success) {
		redirect("/admin/categorias?error=invalid");
	}

	// Borrar arrastraría los artículos a quedarse sin categoría, y publicar
	// exige una: se rechaza mientras esté en uso y se explica por qué.
	const used = await supabase
		.from("articles")
		.select("id", { count: "exact", head: true })
		.eq("category_id", id);
	if (used.error) redirect("/admin/categorias?error=delete");
	if ((used.count ?? 0) > 0) redirect("/admin/categorias?error=in-use");

	const result = await supabase
		.from("categories")
		.delete()
		.eq("id", id)
		.select("id")
		.maybeSingle();
	if (result.error) redirect("/admin/categorias?error=delete");
	if (!result.data) redirect("/admin/categorias?error=not-found");

	revalidateCategories();
	redirect("/admin/categorias?saved=deleted");
}
