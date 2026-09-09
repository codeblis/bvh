export const CONTACT_STATUSES = ["pendiente", "leído", "respondido"] as const;

export const APPLICATION_STATUSES = [
	"nueva",
	"en_revision",
	"contactada",
	"descartada",
] as const;

export const ARTICLE_STATUSES = ["borrador", "publicado"] as const;
export const ARTICLE_TYPES = ["noticia", "blog"] as const;
export const COURSE_STATUSES = ["borrador", "activo", "archivado"] as const;
export const ENROLLMENT_STATUSES = [
	"pendiente",
	"confirmada",
	"lista_espera",
	"cancelada",
	"completada",
] as const;
export const COMPANY_STATUSES = [
	"interesada",
	"cotizando",
	"inactiva",
] as const;

export function inList(list: readonly string[], value: string) {
	return list.includes(value);
}

export const RESOURCE_LABELS: Record<string, string> = {
	articles: "artículo",
	categories: "categoría",
	company_applications: "solicitud RIE-BVH",
	contact_messages: "mensaje de contacto",
	course_enrollments: "inscripción",
	course_offerings: "edición de curso",
	courses: "curso",
	newsletter_subscriptions: "suscripción",
	profiles: "perfil",
};

export const ACTION_LABELS: Record<string, string> = {
	insert: "creó",
	update: "actualizó",
	delete: "eliminó",
};
