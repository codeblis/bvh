import { randomUUID } from "node:crypto";
import { expect, test } from "@playwright/test";
import { createTestUser, deleteTestUser, service, signInPage } from "./local";

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

const ADMIN_VIEWS = [
	"/admin",
	"/admin/mensajes",
	"/admin/solicitudes",
	"/admin/newsletter",
	"/admin/articulos",
	"/admin/articulos/nuevo",
	"/admin/categorias",
	"/admin/cursos",
	"/admin/cursos/inscripciones",
	"/admin/campanas",
	"/admin/usuarios",
	"/admin/auditoria",
	"/admin/empresas",
	"/admin/indices",
] as const;

test("el panel no desborda a 320, 768 ni 1280 px", async ({ page }) => {
	const run = randomUUID().slice(0, 8);
	const admin = await createTestUser(`a11y-admin-${run}@example.test`, true);
	try {
		await signInPage(page, admin.email ?? "", "/admin");
		for (const viewport of VIEWPORTS) {
			await page.setViewportSize({
				width: viewport.width,
				height: viewport.height,
			});
			for (const path of ADMIN_VIEWS) {
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
	} finally {
		await deleteTestUser(admin.id);
	}
});

test("cada vista del panel tiene un encabezado, una región principal y marca la sección actual", async ({
	page,
}) => {
	const run = randomUUID().slice(0, 8);
	const admin = await createTestUser(`a11y-panel-${run}@example.test`, true);
	try {
		await signInPage(page, admin.email ?? "", "/admin");
		for (const path of ADMIN_VIEWS) {
			await page.goto(path);
			await expect(page.locator("main#panel"), path).toHaveCount(1);
			await expect(page.locator("h1"), path).toHaveCount(1);
			// La navegación declara dónde estás, no solo lo colorea.
			await expect(
				page.locator('nav#admin-nav [aria-current="page"]'),
				path,
			).toHaveCount(path === "/admin" ? 0 : 1);
		}
	} finally {
		await deleteTestUser(admin.id);
	}
});

test("los controles del panel tienen nombre accesible y los contadores se anuncian", async ({
	page,
	request,
}) => {
	const run = randomUUID().slice(0, 8);
	const admin = await createTestUser(`a11y-form-${run}@example.test`, true);
	const email = `a11y-cola-${run}@example.test`;
	try {
		// Un mensaje sin leer para que la navegación muestre su contador.
		const submitted = await request.post("/api/contacto", {
			data: {
				nombre: "Persona E2E",
				email,
				asunto: "Otro",
				mensaje: "Mensaje sintético para comprobar el contador de la bandeja.",
			},
		});
		expect(submitted.status()).toBe(200);

		await signInPage(page, admin.email ?? "", "/admin");
		const badge = page
			.locator("nav#admin-nav")
			.getByRole("link", { name: /Mensajes de contacto/ });
		await expect(badge).toContainText("sin atender");

		for (const path of ["/admin/articulos/nuevo", "/admin/usuarios"]) {
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
	} finally {
		const removed = await service
			.from("contact_messages")
			.delete()
			.eq("email", email);
		expect.soft(removed.error).toBeNull();
		await deleteTestUser(admin.id);
	}
});

test("el editor de artículos se recorre y se guarda solo con teclado", async ({
	page,
}) => {
	const run = randomUUID().slice(0, 8);
	const admin = await createTestUser(`a11y-editor-${run}@example.test`, true);
	const title = `Artículo con teclado ${run}`;
	try {
		await signInPage(page, admin.email ?? "", "/admin");
		await page.goto("/admin/articulos/nuevo");

		await page.getByLabel("Titular", { exact: true }).focus();
		await page.keyboard.type(title);
		await page.keyboard.press("Tab");
		await page.keyboard.type("Entradilla escrita con teclado.");
		await page.keyboard.press("Tab");
		await page.keyboard.type("Cuerpo del artículo escrito con teclado.");

		// El foco sigue del manuscrito a la ficha de publicación y llega al
		// botón de guardar sin necesidad de ratón ni de bajar la página.
		const focused = () =>
			page.evaluate(() => {
				const node = document.activeElement as HTMLElement | null;
				return `${node?.tagName}:${node?.getAttribute("name") ?? node?.textContent?.trim() ?? ""}`;
			});
		// El campo de fecha consume varios tabuladores por sus segmentos, así que
		// se avanza hasta el botón en vez de contar pulsaciones.
		const order: string[] = [];
		for (let step = 0; step < 20; step++) {
			await page.keyboard.press("Tab");
			const current = await focused();
			order.push(current);
			if (current.includes("Guardar borrador")) break;
		}
		expect(order.join(" ")).toContain("SELECT:status");
		expect(order.join(" ")).toContain("SELECT:type");
		expect(order.join(" ")).toContain("SELECT:category_id");
		expect(order.join(" ")).toContain("INPUT:slug");
		expect(order[order.length - 1]).toContain("Guardar borrador");

		await page.keyboard.press("Enter");
		await expect(page.getByRole("status")).toContainText("Artículo guardado");
		const stored = await service
			.from("articles")
			.select("id, status")
			.eq("title", title)
			.single();
		expect(stored.data?.status).toBe("borrador");
	} finally {
		const removed = await service.from("articles").delete().eq("title", title);
		expect.soft(removed.error).toBeNull();
		await deleteTestUser(admin.id);
	}
});
