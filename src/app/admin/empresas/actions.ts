"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { slugify } from "@/lib/utils";
import { COMPANY_STATUSES } from "../_status";

const optionalText = (max: number) =>
	z
		.string()
		.trim()
		.max(max)
		.transform((value) => value || null)
		.nullable()
		.catch(null);

const companySchema = z.object({
	id: z.union([z.string().uuid(), z.literal("")]).optional(),
	name: z.string().trim().min(2).max(200),
	slug: z.string().trim().max(200),
	description: optionalText(2000),
	logo_url: optionalText(500),
	sector: optionalText(120),
	website: optionalText(500),
	status: z.enum(COMPANY_STATUSES).catch("interesada"),
});

function text(formData: FormData, key: string) {
	return String(formData.get(key) ?? "").trim();
}

function editorPath(id: string, query: string) {
	return `/admin/empresas/${id || "nuevo"}?${query}`;
}

function revalidateCompanies() {
	revalidatePath("/admin/empresas");
	revalidatePath("/admin");
}

export async function saveCompany(formData: FormData) {
	const { supabase } = await requireAdmin();
	const submittedId = text(formData, "id");
	const parsed = companySchema.safeParse({
		id: submittedId,
		name: text(formData, "name"),
		slug: text(formData, "slug"),
		description: text(formData, "description"),
		logo_url: text(formData, "logo_url"),
		sector: text(formData, "sector"),
		website: text(formData, "website"),
		status: text(formData, "status"),
	});
	if (!parsed.success) redirect(editorPath(submittedId, "error=invalid"));

	const { id, name, slug, ...rest } = parsed.data;
	const payload = { ...rest, name, slug: slugify(slug || name) };
	if (!payload.slug) redirect(editorPath(submittedId, "error=invalid"));

	const result = id
		? await supabase
				.from("companies")
				.update(payload)
				.eq("id", id)
				.select("id")
				.maybeSingle()
		: await supabase.from("companies").insert(payload).select("id").single();

	if (result.error) {
		const reason = result.error.code === "23505" ? "duplicate" : "save";
		redirect(editorPath(id ?? "", `error=${reason}`));
	}
	if (!result.data) redirect(editorPath(id ?? "", "error=not-found"));

	revalidateCompanies();
	redirect(`/admin/empresas?saved=${id ? "updated" : "created"}`);
}

export async function deleteCompany(formData: FormData) {
	const { supabase } = await requireAdmin();
	const id = text(formData, "id");
	if (!z.string().uuid().safeParse(id).success) {
		redirect("/admin/empresas?error=invalid");
	}

	const result = await supabase
		.from("companies")
		.delete()
		.eq("id", id)
		.select("id")
		.maybeSingle();
	if (result.error) redirect("/admin/empresas?error=delete");
	if (!result.data) redirect("/admin/empresas?error=not-found");

	revalidateCompanies();
	redirect("/admin/empresas?saved=deleted");
}
