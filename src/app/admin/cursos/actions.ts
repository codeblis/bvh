"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { parseCourseCatalogForm } from "@/modules/courses/schemas";

function editorPath(formData: FormData) {
	const id = String(formData.get("id") ?? "").trim();
	return `/admin/cursos/${id || "nuevo"}`;
}

export async function saveCourse(formData: FormData) {
	const path = editorPath(formData);
	const parsed = parseCourseCatalogForm(formData);
	if (!parsed.success) redirect(`${path}?error=invalid`);

	const { supabase } = await requireAdmin();
	const data = parsed.data;
	const payload = {
		title: data.title,
		slug: data.slug,
		description: data.description,
		content: data.content,
		image: data.image,
		instructor: data.instructor,
		status: data.status,
	};

	const result = data.id
		? await supabase
				.from("courses")
				.update(payload)
				.eq("id", data.id)
				.select("id")
				.single()
		: await supabase.from("courses").insert(payload).select("id").single();
	const { data: savedCourse, error } = result;
	if (error) redirect(`${path}?error=save`);

	revalidatePath("/admin/cursos");
	revalidatePath("/admin");
	revalidatePath("/instituto");
	redirect(`/admin/cursos/${savedCourse.id}?saved=true`);
}

export async function archiveCourse(formData: FormData) {
	const id = String(formData.get("id") ?? "").trim();
	if (!id) redirect("/admin/cursos?error=invalid");

	const { supabase } = await requireAdmin();
	const { error } = await supabase.rpc("archive_course", { p_course_id: id });
	if (error) redirect("/admin/cursos?error=archive");

	revalidatePath("/admin/cursos");
	revalidatePath("/admin");
	revalidatePath("/instituto");
	redirect("/admin/cursos");
}
