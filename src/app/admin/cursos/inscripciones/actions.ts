"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { enrollmentStatusFormSchema } from "@/modules/courses/schemas";

export async function updateEnrollmentStatus(formData: FormData) {
	const parsed = enrollmentStatusFormSchema.safeParse({
		id: String(formData.get("id") ?? ""),
		status: String(formData.get("status") ?? ""),
	});
	if (!parsed.success) redirect("/admin/cursos/inscripciones?error=invalid");

	const { supabase } = await requireAdmin();
	const { error } = await supabase.rpc("update_course_enrollment_status", {
		p_enrollment_id: parsed.data.id,
		p_status: parsed.data.status,
	});
	if (error) {
		const reason = error.message.includes("course_full") ? "full" : "save";
		redirect(`/admin/cursos/inscripciones?error=${reason}`);
	}

	revalidatePath("/admin/cursos/inscripciones");
	revalidatePath("/cuenta");
	revalidatePath("/admin");
}
