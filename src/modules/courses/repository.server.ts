import "server-only";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { CourseOffering, PublicCourse } from "./types";

const PUBLIC_COURSE_FIELDS =
	"id, slug, title, description, content, image, instructor, course_offerings(id, starts_at, ends_at, timezone, modality, location, price, currency, capacity, status)";

function paragraphs(content: string | null) {
	return (content ?? "")
		.split(/\n\s*\n/)
		.map((paragraph) => paragraph.trim())
		.filter(Boolean);
}

function toOffering(row: {
	id: string;
	starts_at: string | null;
	ends_at: string | null;
	timezone: string;
	modality: string;
	location: string | null;
	price: number | null;
	currency: string;
	capacity: number | null;
}): CourseOffering {
	return {
		id: row.id,
		startsAt: row.starts_at,
		endsAt: row.ends_at,
		timezone: row.timezone,
		modality: row.modality,
		location: row.location,
		price: row.price,
		currency: row.currency,
		capacity: row.capacity,
		availableSeats: null,
	};
}

async function attachAvailability(
	courses: PublicCourse[],
): Promise<PublicCourse[]> {
	const offeringIds = courses.flatMap((course) =>
		course.offerings.map((offering) => offering.id),
	);
	if (offeringIds.length === 0) return courses;

	const supabase = await createClient();
	const { data, error } = await supabase.rpc(
		"get_course_offering_availability",
		{ p_offering_ids: offeringIds },
	);
	if (error) {
		throw new Error(`No se pudo cargar la disponibilidad: ${error.message}`);
	}
	const availability = new Map(
		(data ?? []).map((row) => [row.offering_id, row.available_seats]),
	);

	return courses.map((course) => ({
		...course,
		offerings: course.offerings.map((offering) => ({
			...offering,
			availableSeats: availability.get(offering.id) ?? null,
		})),
	}));
}

function toCourse(row: {
	id: string;
	slug: string;
	title: string;
	description: string | null;
	content: string | null;
	image: string | null;
	instructor: string | null;
	course_offerings: Array<{
		id: string;
		starts_at: string | null;
		ends_at: string | null;
		timezone: string;
		modality: string;
		location: string | null;
		price: number | null;
		currency: string;
		capacity: number | null;
		status: string;
	}>;
}): PublicCourse {
	return {
		id: row.id,
		slug: row.slug,
		title: row.title,
		description: row.description ?? "",
		content: paragraphs(row.content),
		image: row.image,
		instructor: row.instructor,
		offerings: row.course_offerings
			.filter((offering) => offering.status === "abierta")
			.sort((a, b) =>
				(a.starts_at ?? "9999").localeCompare(b.starts_at ?? "9999"),
			)
			.map(toOffering),
	};
}

export async function listPublicCourses() {
	const supabase = await createClient();
	const { data, error } = await supabase
		.from("courses")
		.select(PUBLIC_COURSE_FIELDS)
		.eq("status", "activo")
		.order("title");

	if (error)
		throw new Error(`No se pudieron cargar los cursos: ${error.message}`);
	return attachAvailability(
		(data ?? []).map(toCourse).filter((course) => course.offerings.length > 0),
	);
}

export const getPublicCourse = cache(async (slug: string) => {
	const supabase = await createClient();
	const { data, error } = await supabase
		.from("courses")
		.select(PUBLIC_COURSE_FIELDS)
		.eq("status", "activo")
		.eq("slug", slug)
		.maybeSingle();

	if (error) throw new Error(`No se pudo cargar el curso: ${error.message}`);
	if (!data) return null;
	const [course] = await attachAvailability([toCourse(data)]);
	return course;
});
