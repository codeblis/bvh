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

export const MODALITY_LABELS: Record<string, string> = {
	online: "En línea",
	presencial: "Presencial",
	hibrida: "Híbrida",
	por_confirmar: "Modalidad por confirmar",
};

export const OFFERING_STATUS_LABELS: Record<string, string> = {
	borrador: "Borrador",
	abierta: "Abierta",
	cerrada: "Cerrada",
	cancelada: "Cancelada",
	finalizada: "Finalizada",
};

export const COURSE_STATUS_LABELS: Record<string, string> = {
	borrador: "Borrador",
	activo: "Activo",
	archivado: "Archivado",
};

export const APPLICATION_STATUS_LABELS: Record<string, string> = {
	nueva: "Nueva",
	en_revision: "En revisión",
	contactada: "Contactada",
	descartada: "Descartada",
};

export const CONTACT_STATUS_LABELS: Record<string, string> = {
	pendiente: "Pendiente",
	leído: "Leído",
	respondido: "Respondido",
};

export const ENROLLMENT_STATUS_LABELS: Record<string, string> = {
	pendiente: "Pendiente",
	confirmada: "Confirmada",
	lista_espera: "En lista de espera",
	cancelada: "Cancelada",
	completada: "Completada",
};

export const ARTICLE_TYPE_LABELS: Record<string, string> = {
	noticia: "Noticia",
	blog: "Blog",
};

export const ARTICLE_STATUS_LABELS: Record<string, string> = {
	borrador: "Borrador",
	publicado: "Publicado",
};

export const COMPANY_STATUS_LABELS: Record<string, string> = {
	interesada: "Interesada",
	cotizando: "Cotizando",
	inactiva: "Inactiva",
};
