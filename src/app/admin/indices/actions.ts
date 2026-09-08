"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";

const optionalNumber = z
	.union([z.literal(""), z.coerce.number().finite()])
	.transform((value) => (value === "" ? null : value));

const indexSchema = z.object({
	id: z.union([z.string().uuid(), z.literal("")]).optional(),
	name: z.string().trim().min(1).max(120),
	value: z.coerce.number().finite(),
	change: optionalNumber,
	change_percent: optionalNumber,
});

function text(formData: FormData, key: string) {
	return String(formData.get(key) ?? "").trim();
}

function revalidateIndices() {
	revalidatePath("/admin/indices");
	revalidatePath("/admin");
}

export async function saveIndex(formData: FormData) {
	const { supabase } = await requireAdmin();
	const parsed = indexSchema.safeParse({
		id: text(formData, "id"),
		name: text(formData, "name"),
		value: text(formData, "value"),
		change: text(formData, "change"),
		change_percent: text(formData, "change_percent"),
	});
	if (!parsed.success) redirect("/admin/indices?error=invalid");

	const { id, ...values } = parsed.data;
	const payload = { ...values, last_updated: new Date().toISOString() };

	const result = id
		? await supabase
				.from("indices")
				.update(payload)
				.eq("id", id)
				.select("id")
				.maybeSingle()
		: await supabase.from("indices").insert(payload).select("id").single();

	if (result.error) {
		const reason = result.error.code === "23505" ? "duplicate" : "save";
		redirect(`/admin/indices?error=${reason}`);
	}
	if (!result.data) redirect("/admin/indices?error=not-found");

	revalidateIndices();
	redirect(`/admin/indices?saved=${id ? "updated" : "created"}`);
}

export async function deleteIndex(formData: FormData) {
	const { supabase } = await requireAdmin();
	const id = text(formData, "id");
	if (!z.string().uuid().safeParse(id).success) {
		redirect("/admin/indices?error=invalid");
	}

	const result = await supabase
		.from("indices")
		.delete()
		.eq("id", id)
		.select("id")
		.maybeSingle();
	if (result.error) redirect("/admin/indices?error=delete");
	if (!result.data) redirect("/admin/indices?error=not-found");

	revalidateIndices();
	redirect("/admin/indices?saved=deleted");
}
