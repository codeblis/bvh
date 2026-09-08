import { randomUUID } from "node:crypto";
import { expect, test } from "@playwright/test";
import { service } from "./local";

const VIEWPORTS = [
	{ name: "móvil 320", width: 320, height: 640 },
	{ name: "tableta 768", width: 768, height: 1024 },
	{ name: "escritorio 1280", width: 1280, height: 800 },
];

const FLOWS = ["/", "/noticias", "/blog", "/instituto", "/contacto", "/login"];

test("los flujos críticos no provocan scroll horizontal en móvil, tableta ni escritorio", async ({
	page,
}) => {
	for (const viewport of VIEWPORTS) {
		await page.setViewportSize({
			width: viewport.width,
			height: viewport.height,
		});
		for (const path of FLOWS) {
			await page.goto(path);
			const overflow = await page.evaluate(() => ({
				scrollWidth: document.documentElement.scrollWidth,
				clientWidth: document.documentElement.clientWidth,
			}));
			expect(
				overflow.scrollWidth,
				`${path} a ${viewport.name}: ${overflow.scrollWidth} > ${overflow.clientWidth}`,
			).toBeLessThanOrEqual(overflow.clientWidth + 1);
		}
	}
});

test("cada control de los formularios críticos tiene nombre accesible", async ({
	page,
}) => {
	for (const path of ["/contacto", "/login", "/registro"]) {
		await page.goto(path);
		const unnamed = await page.evaluate(() => {
			const missing: string[] = [];
			for (const field of document.querySelectorAll<HTMLElement>(
				"input:not([type=hidden]), select, textarea",
			)) {
				if (field.offsetParent === null) continue;
				const id = field.getAttribute("id");
				const label = id
					? document.querySelector(`label[for="${CSS.escape(id)}"]`)
					: field.closest("label");
				const name =
					field.getAttribute("aria-label") ??
					label?.textContent?.trim() ??
					field.getAttribute("placeholder") ??
					"";
				if (!name) missing.push(field.getAttribute("name") ?? field.tagName);
			}
			return missing;
		});
		expect(unnamed, path).toEqual([]);
	}
});

test("el formulario de contacto se completa y envía solo con teclado", async ({
	page,
}) => {
	const email = `a11y-${randomUUID()}@example.test`;
	await page.setViewportSize({ width: 320, height: 640 });
	try {
		await page.goto("/contacto");
		await page.getByLabel("Nombre *", { exact: true }).focus();
		await page.keyboard.type("Persona con teclado");
		await page.keyboard.press("Tab");
		await page.keyboard.type(email);
		await page.keyboard.press("Tab");
		// La lista de asuntos se resuelve escribiendo la inicial de la opción.
		await page.keyboard.press("o");
		expect(
			await page.evaluate(
				() =>
					(document.querySelector('select[name="asunto"]') as HTMLSelectElement)
						?.value,
			),
		).toBe("Otro");
		await page.keyboard.press("Tab");
		await page.keyboard.type(
			"Mensaje escrito íntegramente con teclado para revisar el foco.",
		);

		// El foco sigue el orden visual hasta el botón de envío.
		const focused = async () =>
			page.evaluate(() => {
				const node = document.activeElement as HTMLElement | null;
				return `${node?.tagName ?? ""}:${node?.getAttribute("name") ?? node?.textContent?.trim() ?? ""}`;
			});
		expect(await focused()).toContain("TEXTAREA");
		await page.keyboard.press("Tab");
		expect(await focused()).toContain("Enviar mensaje");

		// Y el foco es visible: el navegador expone un anillo, no lo suprime.
		const outline = await page.evaluate(() => {
			const node = document.activeElement as HTMLElement;
			const style = getComputedStyle(node);
			return {
				outlineStyle: style.outlineStyle,
				boxShadow: style.boxShadow,
				ring: style.getPropertyValue("--tw-ring-shadow"),
			};
		});
		expect(
			outline.outlineStyle !== "none" ||
				outline.boxShadow !== "none" ||
				Boolean(outline.ring),
		).toBe(true);

		await page.keyboard.press("Enter");
		await expect(
			page.getByText(
				"El aviso por correo está pendiente; no necesitas reenviar el formulario.",
			),
		).toBeVisible();
		const stored = await service
			.from("contact_messages")
			.select("id")
			.eq("email", email);
		expect(stored.data).toHaveLength(1);
	} finally {
		const removed = await service
			.from("contact_messages")
			.delete()
			.eq("email", email);
		expect.soft(removed.error).toBeNull();
	}
});

test("el ticker y los pulsos dejan de animarse cuando se pide menos movimiento", async ({
	page,
}) => {
	await page.emulateMedia({ reducedMotion: "reduce" });
	await page.goto("/");
	const animations = await page.evaluate(() => {
		const read = (selector: string) => {
			const node = document.querySelector(selector);
			return node ? getComputedStyle(node).animationName : "sin-elemento";
		};
		return {
			ticker: read(".ticker-track"),
			pulse: read(".pulse-dot"),
		};
	});
	expect(animations.ticker).toBe("none");
	if (animations.pulse !== "sin-elemento") {
		expect(animations.pulse).toBe("none");
	}
});

test("el texto principal y el botón de acción cumplen el contraste mínimo", async ({
	page,
}) => {
	await page.goto("/contacto");
	const contrast = await page.evaluate(() => {
		const channel = (value: number) =>
			value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
		const luminance = (rgb: number[]) =>
			0.2126 * channel(rgb[0] / 255) +
			0.7152 * channel(rgb[1] / 255) +
			0.0722 * channel(rgb[2] / 255);
		// Los colores del tema son OKLCH: se resuelven pintando un píxel.
		const canvas = document.createElement("canvas");
		canvas.width = 1;
		canvas.height = 1;
		const ctx = canvas.getContext("2d", {
			willReadFrequently: true,
		}) as CanvasRenderingContext2D;
		const parse = (value: string) => {
			ctx.clearRect(0, 0, 1, 1);
			ctx.fillStyle = "#000";
			ctx.fillStyle = value;
			ctx.fillRect(0, 0, 1, 1);
			const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
			return [r, g, b];
		};
		const opaque = (value: string) => {
			if (value === "transparent") return false;
			const parts = value.match(/[\d.]+/g) ?? [];
			return !value.startsWith("rgba") || Number(parts[3]) > 0;
		};
		const background = (node: Element): number[] => {
			let current: Element | null = node;
			while (current) {
				const color = getComputedStyle(current).backgroundColor;
				if (color && color !== "transparent" && opaque(color)) {
					return parse(color);
				}
				current = current.parentElement;
			}
			return [0, 0, 0];
		};
		const ratio = (selector: string) => {
			const node = document.querySelector(selector);
			if (!node) return null;
			const front = luminance(parse(getComputedStyle(node).color));
			const back = luminance(background(node));
			const [light, dark] = front > back ? [front, back] : [back, front];
			return (light + 0.05) / (dark + 0.05);
		};
		return {
			heading: ratio("h1"),
			button: ratio('button[type="submit"]'),
		};
	});
	// AA para texto grande y para el texto de un control.
	expect(contrast.heading ?? 0).toBeGreaterThanOrEqual(3);
	expect(contrast.button ?? 0).toBeGreaterThanOrEqual(4.5);
});

test("cada página pública expone un único contenido principal y un salto hacia él", async ({
	page,
}) => {
	for (const path of FLOWS) {
		await page.goto(path);
		if (path === "/login") continue;
		await expect(page.locator("main#contenido"), path).toHaveCount(1);
		await expect(page.locator("header"), path).toHaveCount(1);

		// El primer tabulado ofrece el salto al contenido y el enlace funciona.
		await page.keyboard.press("Tab");
		const skip = page.getByRole("link", { name: "Saltar al contenido" });
		await expect(skip, path).toBeFocused();
		await page.keyboard.press("Enter");
		await expect(page, path).toHaveURL((url) => url.hash === "#contenido");
	}
});
