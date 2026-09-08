"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { enrollmentFormSchema } from "@/modules/courses/schemas";

export async function enrollInCourse(formData: FormData) {
	const parsed = enrollmentFormSchema.safeParse({
		offeringId: String(formData.get("offeringId") ?? ""),
		courseSlug: String(formData.get("courseSlug") ?? ""),
	});
	if (!parsed.success) redirect("/instituto?error=invalid");

	const coursePath = `/instituto/cursos/${parsed.data.courseSlug}`;
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) {
		redirect(`/login?callbackUrl=${encodeURIComponent(coursePath)}`);
	}

	const { error } = await supabase.rpc("enroll_in_course", {
		p_offering_id: parsed.data.offeringId,
	});
	if (error) {
		const reason = error.message.includes("course_full") ? "full" : "failed";
		redirect(`${coursePath}?enrollmentError=${reason}`);
	}

	revalidatePath("/cuenta");
	redirect(`${coursePath}?enrolled=true`);
}
