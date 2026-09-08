"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { parseCourseOfferingForm } from "@/modules/courses/schemas";

function editorPath(courseId: string, offeringId: string) {
	return `/admin/cursos/${courseId}/ofertas/${offeringId || "nueva"}`;
}

export async function saveCourseOffering(formData: FormData) {
	const courseId = String(formData.get("course_id") ?? "").trim();
	const offeringId = String(formData.get("offering_id") ?? "").trim();
	const path = editorPath(courseId, offeringId);
	const parsed = parseCourseOfferingForm(formData);
	if (!parsed.success) redirect(`${path}?error=invalid`);

	const { supabase } = await requireAdmin();
	const data = parsed.data;
	const { data: savedOfferingId, error } = await supabase.rpc(
		"save_course_offering",
		{
			p_course_id: data.courseId,
			p_offering: {
				id: data.offeringId ?? "",
				starts_at: data.startsAt,
				ends_at: data.endsAt,
				timezone: data.timezone,
				modality: data.modality,
				location: data.location ?? "",
				price: data.price?.toString() ?? "",
				currency: data.currency,
				capacity: data.capacity?.toString() ?? "",
				status: data.offeringStatus,
			},
		},
	);
	if (error) {
		const reason = error.message.includes("capacity_below_enrollments")
			? "capacity"
			: "save";
		redirect(`${path}?error=${reason}`);
	}

	revalidatePath(`/admin/cursos/${data.courseId}`);
	revalidatePath("/admin/cursos");
	revalidatePath("/instituto");
	redirect(
		`/admin/cursos/${data.courseId}/ofertas/${savedOfferingId}?saved=true`,
	);
}

export async function closeCourseOffering(formData: FormData) {
	const courseId = String(formData.get("course_id") ?? "").trim();
	const offeringId = String(formData.get("offering_id") ?? "").trim();
	const path = editorPath(courseId, offeringId);
	const identity = z
		.object({ courseId: z.string().uuid(), offeringId: z.string().uuid() })
		.safeParse({ courseId, offeringId });
	if (!identity.success) redirect("/admin/cursos?error=invalid");
	const { supabase } = await requireAdmin();
	const { data, error } = await supabase
		.from("course_offerings")
		.update({ status: "cerrada" })
		.eq("id", identity.data.offeringId)
		.eq("course_id", identity.data.courseId)
		.select("id")
		.single();
	if (error || !data) redirect(`${path}?error=close`);

	revalidatePath(`/admin/cursos/${identity.data.courseId}`);
	revalidatePath("/admin/cursos");
	revalidatePath("/instituto");
	redirect(`/admin/cursos/${identity.data.courseId}`);
}
