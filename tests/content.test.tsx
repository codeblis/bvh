import { renderToStaticMarkup } from "react-dom/server";
import { expect, test } from "vitest";
import {
	MarkdownContent,
	parseMarkdownBlocks,
} from "../src/components/bvh/MarkdownContent.tsx";
import {
	createEditorialImagePath,
	EDITORIAL_IMAGE_MAX_BYTES,
	isManagedEditorialPath,
	validateEditorialImage,
} from "../src/modules/content/media.ts";

test("valida formato y tamaño de portadas editoriales", () => {
	expect(validateEditorialImage({ size: 20_000, type: "image/webp" })).toEqual({
		ok: true,
		extension: "webp",
	});
	expect(
		validateEditorialImage({
			size: EDITORIAL_IMAGE_MAX_BYTES + 1,
			type: "image/jpeg",
		}),
	).toEqual({ ok: false, error: "too_large" });
	expect(validateEditorialImage({ size: 100, type: "image/svg+xml" })).toEqual({
		ok: false,
		error: "type",
	});
});

test("genera una ruta controlada sin reutilizar el nombre del archivo", () => {
	expect(
		createEditorialImagePath(
			"noticia",
			"ad438e57-d60c-4cb7-9a50-99120f6c6013",
			"avif",
			"media-id",
		),
	).toBe("noticia/ad438e57-d60c-4cb7-9a50-99120f6c6013/media-id.avif");
	expect(isManagedEditorialPath("blog/id/image.webp")).toBe(true);
	expect(isManagedEditorialPath("https://legacy.example/cover.jpg")).toBe(
		false,
	);
});

test("parsea el subconjunto editorial de Markdown", () => {
	const blocks = parseMarkdownBlocks(
		"## Título\n\nUn párrafo.\n\n- uno\n- dos\n\n> una cita",
	);
	expect(blocks.map((block) => block.kind)).toEqual([
		"heading",
		"paragraph",
		"list",
		"quote",
	]);
});

test("escapa HTML y descarta protocolos peligrosos", () => {
	const html = renderToStaticMarkup(
		<MarkdownContent
			source={'Texto <script>alert("x")</script>\n\n[mal](javascript:evil)'}
		/>,
	);
	expect(html).toContain("&lt;script&gt;");
	expect(html).not.toContain("<script>");
	expect(html).not.toContain("javascript:evil");
});
