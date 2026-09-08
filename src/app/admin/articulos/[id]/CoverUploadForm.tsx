"use client";

import { type FormEvent, useState } from "react";
import {
	EDITORIAL_IMAGE_ACCEPT,
	validateEditorialImage,
} from "@/modules/content/media";
import { uploadArticleCover } from "../actions";

const errorMessages = {
	empty: "El archivo está vacío.",
	too_large: "La portada supera el límite de 5 MB.",
	type: "Formato no permitido. Usa JPG, PNG, WebP o AVIF.",
};

export function CoverUploadForm({
	articleId,
	defaultAlt,
	hasCover,
}: {
	articleId: string;
	defaultAlt?: string | null;
	hasCover: boolean;
}) {
	const [error, setError] = useState<string | null>(null);

	function validate(event: FormEvent<HTMLFormElement>) {
		const file = new FormData(event.currentTarget).get("cover");
		if (!(file instanceof File)) {
			event.preventDefault();
			setError("Selecciona un archivo de imagen.");
			return;
		}
		const result = validateEditorialImage(file);
		if (!result.ok) {
			event.preventDefault();
			setError(errorMessages[result.error]);
			return;
		}
		setError(null);
	}

	return (
		<form
			action={uploadArticleCover}
			onSubmit={validate}
			className="mt-4 space-y-4"
		>
			<input type="hidden" name="id" value={articleId} />
			<label htmlFor="featured_image_alt" className="block text-[13px]">
				<span className="font-medium text-foreground">Texto alternativo</span>
				<input
					id="featured_image_alt"
					name="featured_image_alt"
					defaultValue={defaultAlt ?? ""}
					minLength={3}
					maxLength={300}
					required
					className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
				/>
				<span className="mt-1 block text-xs text-muted-foreground">
					Describe la información visual relevante; no escribas «imagen de».
				</span>
			</label>
			<label htmlFor="cover" className="block text-[13px]">
				<span className="font-medium text-foreground">Archivo</span>
				<input
					id="cover"
					name="cover"
					type="file"
					accept={EDITORIAL_IMAGE_ACCEPT}
					required
					className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
				/>
			</label>
			{error ? (
				<p className="text-sm text-destructive" role="alert">
					{error}
				</p>
			) : null}
			<button
				type="submit"
				className="rounded-md bg-primary px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-primary-foreground transition hover:brightness-110"
			>
				{hasCover ? "Reemplazar portada" : "Subir portada"}
			</button>
		</form>
	);
}
