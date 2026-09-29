// Reutiliza el parser de bloques del renderer público para que el correo y la
// web entiendan el mismo Markdown. Aquí solo cambia la salida: HTML de correo
// con estilos en línea, porque los clientes de correo ignoran las hojas.
import { parseMarkdownBlocks } from "@/components/bvh/MarkdownContent";
import { escapeHtml } from "@/lib/forms";

function safeHref(value: string) {
	try {
		const url = new URL(value);
		return url.protocol === "http:" || url.protocol === "https:" ? value : null;
	} catch {
		return null;
	}
}

// Se escapa ANTES de buscar marcas: ninguno de los delimitadores de Markdown
// aparece en las entidades HTML, así que el orden es seguro y el texto del
// autor nunca puede introducir etiquetas.
function inlineHtml(text: string) {
	const escaped = escapeHtml(text);
	const pattern = /(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g;
	let result = "";
	let cursor = 0;

	for (const match of escaped.matchAll(pattern)) {
		const start = match.index ?? 0;
		result += escaped.slice(cursor, start);
		const token = match[0];

		const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
		if (link) {
			const href = safeHref(link[2].trim());
			result += href
				? `<a href="${href}" style="color:#9a7b3f;text-decoration:underline">${link[1]}</a>`
				: link[1];
		} else if (token.startsWith("**")) {
			result += `<strong>${token.slice(2, -2)}</strong>`;
		} else if (token.startsWith("`")) {
			result += `<code>${token.slice(1, -1)}</code>`;
		} else {
			result += `<em>${token.slice(1, -1)}</em>`;
		}
		cursor = start + token.length;
	}
	result += escaped.slice(cursor);
	return result;
}

export function markdownToEmailHtml(source: string) {
	return parseMarkdownBlocks(source)
		.map((block) => {
			if (block.kind === "heading") {
				const size = block.level === 2 ? 22 : 18;
				return `<h${block.level} style="margin:24px 0 8px;font-size:${size}px;color:#1b1b1b">${inlineHtml(block.text)}</h${block.level}>`;
			}
			if (block.kind === "quote") {
				return `<blockquote style="margin:16px 0;padding:8px 16px;border-left:3px solid #9a7b3f;color:#555">${inlineHtml(block.text)}</blockquote>`;
			}
			if (block.kind === "list") {
				const tag = block.ordered ? "ol" : "ul";
				const items = block.items
					.map((item) => `<li style="margin:4px 0">${inlineHtml(item)}</li>`)
					.join("");
				return `<${tag} style="margin:12px 0;padding-left:20px">${items}</${tag}>`;
			}
			return `<p style="margin:12px 0;line-height:1.6">${inlineHtml(block.text)}</p>`;
		})
		.join("");
}

export type CampaignEmailInput = {
	subject: string;
	body: string;
	recipientName: string | null;
	// Solo las campañas de lista lo llevan: el correo operativo de un curso no
	// ofrece baja del boletín porque no es boletín.
	unsubscribeUrl: string | null;
	operationalNote: string | null;
};

export function campaignEmailHtml(input: CampaignEmailInput) {
	const greeting = input.recipientName
		? `<p style="margin:0 0 12px">Hola ${escapeHtml(input.recipientName)},</p>`
		: "";
	const footer = input.unsubscribeUrl
		? `<p style="margin:24px 0 0;font-size:12px;color:#777">Recibes este correo porque te suscribiste al boletín de la BVH. <a href="${input.unsubscribeUrl}" style="color:#777">Darte de baja</a>.</p>`
		: input.operationalNote
			? `<p style="margin:24px 0 0;font-size:12px;color:#777">${escapeHtml(input.operationalNote)}</p>`
			: "";

	return `<div style="max-width:600px;margin:0 auto;font-family:Georgia,'Times New Roman',serif;color:#1b1b1b">
<h1 style="font-size:20px;margin:0 0 16px">${escapeHtml(input.subject)}</h1>
${greeting}${markdownToEmailHtml(input.body)}
${footer}
</div>`;
}
