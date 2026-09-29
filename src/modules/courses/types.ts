export type CourseOffering = {
	id: string;
	startsAt: string | null;
	endsAt: string | null;
	timezone: string;
	modality: string;
	location: string | null;
	price: number | null;
	currency: string;
	capacity: number | null;
	availableSeats: number | null;
};

export type PublicCourse = {
	id: string;
	slug: string;
	title: string;
	description: string;
	content: string[];
	image: string | null;
	instructor: string | null;
	offerings: CourseOffering[];
};
