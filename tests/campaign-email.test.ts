import { expect, test } from "vitest";
import {
	campaignEmailHtml,
	markdownToEmailHtml,
} from "../src/modules/newsletter/campaign-email.ts";

test("markdownToEmailHtml renders blocks with inline styles", () => {
	const html = markdownToEmailHtml(
		"## Título\n\nUn **párrafo** con [enlace](https://bvh.cu).\n\n- uno\n- dos",
	);
	expect(html).toContain("<h2");
	expect(html).toContain("<strong>párrafo</strong>");
	expect(html).toContain('<a href="https://bvh.cu"');
	expect(html).toContain("<li");
	expect(html).toContain("uno");
});

test("markdownToEmailHtml escapes author input instead of emitting tags", () => {
	const html = markdownToEmailHtml('<img src=x onerror="alert(1)">');
	// Nada de lo que escriba el autor puede cerrar una etiqueta ni abrir un
	// atributo: queda como texto visible, que es exactamente lo que se quiere.
	expect(html).not.toContain("<img");
	expect(html).not.toContain('onerror="');
	expect(html).toContain("&lt;img");
	expect(html).toContain("&quot;alert(1)&quot;");
});

test("markdownToEmailHtml drops links with a non-http scheme", () => {
	const html = markdownToEmailHtml("[pulsa](javascript:alert(1))");
	expect(html).not.toContain("javascript:");
	// El texto del enlace sobrevive; lo que se pierde es el destino.
	expect(html).toContain("pulsa");
});

test("campaignEmailHtml only offers an unsubscribe link when there is consent", () => {
	const marketing = campaignEmailHtml({
		subject: "Boletín",
		body: "Contenido del boletín.",
		recipientName: "Ana",
		unsubscribeUrl: "https://bvh.cu/newsletter/baja?token=abc",
		operationalNote: null,
	});
	expect(marketing).toContain("Hola Ana");
	expect(marketing).toContain("Darte de baja");

	const operational = campaignEmailHtml({
		subject: "Cambio de aula",
		body: "El curso cambia de aula.",
		recipientName: null,
		unsubscribeUrl: null,
		operationalNote: "Recibes este aviso porque tienes una inscripción.",
	});
	expect(operational).not.toContain("Darte de baja");
	expect(operational).toContain("tienes una inscripción");
});

test("campaignEmailHtml escapes the subject and the recipient name", () => {
	const html = campaignEmailHtml({
		subject: "<script>alert(1)</script>",
		body: "Cuerpo.",
		recipientName: "<b>Ana</b>",
		unsubscribeUrl: null,
		operationalNote: null,
	});
	expect(html).not.toContain("<script>");
	expect(html).not.toContain("<b>Ana</b>");
	expect(html).toContain("&lt;script&gt;");
});
