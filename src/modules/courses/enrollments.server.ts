import "server-only";

import { createClient } from "@/lib/supabase/server";

export async function listMyCourseEnrollments() {
	const supabase = await createClient();
	const { data, error } = await supabase.rpc("get_my_course_enrollments");
	if (error) throw new Error("No se pudieron cargar tus inscripciones.");
	return data ?? [];
}
