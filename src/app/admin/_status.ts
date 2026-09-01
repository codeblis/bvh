export const CONTACT_STATUSES = ["pendiente", "leído", "respondido"] as const;

export const APPLICATION_STATUSES = [
	"nueva",
	"en_revision",
	"contactada",
	"descartada",
] as const;

export const ARTICLE_STATUSES = ["borrador", "publicado"] as const;
export const ARTICLE_TYPES = ["noticia", "blog"] as const;
export const COURSE_STATUSES = ["activo", "inactivo", "completado"] as const;
export const COMPANY_STATUSES = ["interesada", "cotizando", "inactiva"] as const;

export function inList(list: readonly string[], value: string) {
	return list.includes(value);
}
