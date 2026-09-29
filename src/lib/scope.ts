import { notFound } from "next/navigation";

/**
 * Alcance publicado.
 *
 * El MVP editorial expone solo portada, noticias y blog. El resto de los
 * módulos —índices, mercados, cotizar, instituto, páginas institucionales y
 * formularios públicos— sigue en el repositorio y vuelve apagando esta
 * bandera; no se borra código para recortar el lanzamiento.
 *
 * El alcance editorial es el valor por defecto **a propósito**: si la variable
 * falta en un despliegue se publica de menos, no de más. Exponer módulos con
 * datos simulados por un olvido de configuración es el fallo que no queremos,
 * y es el que cometería un valor por defecto permisivo.
 *
 * Al ser `NEXT_PUBLIC_` queda incrustada en el build, así que la leen igual un
 * componente de servidor y uno de cliente. Cambiarla exige reconstruir: es una
 * decisión de alcance, no un interruptor de operación.
 */
export const EDITORIAL_SCOPE_VARIABLE = "NEXT_PUBLIC_MVP_EDITORIAL";

const DISABLED = new Set(["0", "false", "off", "no"]);

export function isEditorialScope(
	value: string | undefined = process.env.NEXT_PUBLIC_MVP_EDITORIAL,
): boolean {
	if (value === undefined) return true;
	const normalized = value.trim().toLowerCase();
	if (normalized === "") return true;
	return !DISABLED.has(normalized);
}

/**
 * Lo que el alcance editorial publica. Cualquier otra ruta pública responde
 * 404 mientras la bandera esté activa.
 */
export const EDITORIAL_PATHS = [
	"",
	"/noticias",
	"/blog",
	"/privacidad",
	"/terminos",
] as const;

/**
 * Corta la ruta cuando queda fuera del alcance publicado. Se llama al entrar
 * en la página, antes de cualquier consulta: una ruta que no se publica
 * tampoco toca la base.
 *
 * Responde 404 y no 503 ni redirección porque, de cara a quien visita, la
 * sección no existe todavía. Un 503 prometería que vuelve sola.
 */
export function blockOutsideEditorialScope(): void {
	if (isEditorialScope()) notFound();
}

/**
 * Equivalente para los `route handlers`, donde conviene devolver la respuesta
 * en vez de lanzar: así el endpoint no aparece como error de la aplicación.
 */
export function outOfScopeResponse(): Response | null {
	if (!isEditorialScope()) return null;
	return new Response(null, {
		status: 404,
		headers: { "Cache-Control": "no-store" },
	});
}
