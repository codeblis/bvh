import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

function first<T>(value: T | T[] | null): T | null {
	return Array.isArray(value) ? (value[0] ?? null) : value;
}

// Las dos audiencias posibles, en la forma que espera el selector.
export async function loadAudienceOptions(
	supabase: SupabaseClient<Database>,
) {
	const [lists, offerings] = await Promise.all([
		supabase
			.from("newsletter_lists")
			.select("id, name")
			.eq("is_active", true)
			.order("name"),
		supabase
			.from("course_offerings")
			.select("id, starts_at, status, courses(title)")
			.in("status", ["abierta", "cerrada", "finalizada"])
			.order("starts_at", { ascending: false }),
	]);
	if (lists.error) throw new Error(lists.error.message);
	if (offerings.error) throw new Error(offerings.error.message);

	return {
		lists: (lists.data ?? []).map((list) => ({
			value: list.id,
			label: list.name,
		})),
		offerings: (offerings.data ?? []).map((offering) => {
			const course = first(offering.courses);
			const when = offering.starts_at
				? new Date(offering.starts_at).toLocaleDateString("es")
				: "sin fecha";
			return {
				value: offering.id,
				label: `${course?.title ?? "Curso"} · ${when}`,
			};
		}),
	};
}
