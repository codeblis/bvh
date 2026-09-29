export const EDITORIAL_BUCKET = "editorial";
export const EDITORIAL_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const EDITORIAL_IMAGE_ACCEPT =
	"image/jpeg,image/png,image/webp,image/avif";

const EXTENSION_BY_MIME = {
	"image/jpeg": "jpg",
	"image/png": "png",
	"image/webp": "webp",
	"image/avif": "avif",
} as const;

export type EditorialImageMime = keyof typeof EXTENSION_BY_MIME;

export function validateEditorialImage(file: { size: number; type: string }) {
	if (file.size <= 0) return { ok: false as const, error: "empty" as const };
	if (file.size > EDITORIAL_IMAGE_MAX_BYTES) {
		return { ok: false as const, error: "too_large" as const };
	}

	const extension = EXTENSION_BY_MIME[file.type as EditorialImageMime];
	if (!extension) return { ok: false as const, error: "type" as const };

	return { ok: true as const, extension };
}

export function createEditorialImagePath(
	type: "noticia" | "blog",
	articleId: string,
	extension: string,
	id = crypto.randomUUID(),
) {
	return `${type}/${articleId}/${id}.${extension}`;
}

export function isManagedEditorialPath(path: string | null | undefined) {
	return Boolean(path && !/^https?:\/\//i.test(path));
}
