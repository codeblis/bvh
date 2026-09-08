import { randomUUID } from "node:crypto";
import { expect, test } from "@playwright/test";
import { createTestUser, deleteTestUser, service, signInPage } from "./local";

const VIEWS = [
	{ path: "/admin", heading: "Resumen" },
	{ path: "/admin/mensajes", heading: "Mensajes de contacto" },
	{ path: "/admin/solicitudes", heading: "Solicitudes RIE-BVH" },
	{ path: "/admin/newsletter", heading: "Newsletter" },
	{ path: "/admin/articulos", heading: "Artículos" },
	{ path: "/admin/cursos", heading: "Cursos" },
	{ path: "/admin/cursos/inscripciones", heading: "Inscripciones" },
	{ path: "/admin/auditoria", heading: "Auditoría" },
	{ path: "/admin/empresas", heading: "Empresas" },
	{ path: "/admin/empresas/nuevo", heading: "Nueva empresa" },
	{ path: "/admin/indices", heading: "Índices" },
] as const;

test("cada vista del CMS carga para admin y niega el acceso a visitante y usuario", async ({
	page,
	browser,
}) => {
	const run = randomUUID();
	const admin = await createTestUser(`cms-admin-${run}@example.test`, true);
	const student = await createTestUser(`cms-user-${run}@example.test`);
	const visitor = await browser.newPage({ baseURL: "http://127.0.0.1:3100" });
	const member = await browser.newPage({ baseURL: "http://127.0.0.1:3100" });
	try {
		await signInPage(page, admin.email ?? "", "/admin");
		for (const view of VIEWS) {
			const response = await page.goto(view.path);
			expect(response?.status(), view.path).toBe(200);
			await expect(
				page.getByRole("heading", { name: view.heading, exact: true }),
				view.path,
			).toBeVisible();
			// Ninguna vista se queda en blanco ni muestra el error de sección.
			await expect(
				page.getByText("No se pudo cargar esta sección"),
				view.path,
			).toHaveCount(0);
		}

		await signInPage(member, student.email ?? "", "/cuenta");
		for (const view of VIEWS) {
			await visitor.goto(view.path);
			await expect(visitor, view.path).toHaveURL(
				(url) => url.pathname === "/login",
			);
			await expect(visitor.getByText("BVH · Panel"), view.path).toHaveCount(0);

			await member.goto(view.path);
			await expect(member, view.path).toHaveURL(
				(url) => url.pathname === "/cuenta",
			);
			await expect(member.getByText("BVH · Panel"), view.path).toHaveCount(0);
		}
	} finally {
		await visitor.close();
		await member.close();
		await deleteTestUser(admin.id);
		await deleteTestUser(student.id);
	}
});

test("empresas: alta, vacío, duplicado rechazado, validación de servidor y borrado confirmado", async ({
	page,
}) => {
	const run = randomUUID().slice(0, 8);
	const name = `Empresa CMS ${run}`;
	const admin = await createTestUser(`cms-empresas-${run}@example.test`, true);
	try {
		await signInPage(page, admin.email ?? "", "/admin");
		await page.goto("/admin/empresas");
		const emptyState = page.getByText("Sin empresas en el directorio.");
		const startedEmpty = await emptyState.isVisible();

		await page.goto("/admin/empresas/nuevo");
		await page.getByLabel("Nombre", { exact: true }).fill(name);
		await page.getByLabel("Sector", { exact: true }).fill("Tecnología");
		await page.getByRole("button", { name: "Guardar" }).click();
		await expect(page).toHaveURL((url) => url.pathname === "/admin/empresas");
		await expect(page.getByRole("status")).toHaveText("Empresa creada.");
		await expect(page.getByRole("row").filter({ hasText: name })).toContainText(
			"Tecnología",
		);
		if (startedEmpty) await expect(emptyState).toHaveCount(0);

		// El nombre es único en la base: el fallo no puede presentarse como éxito.
		await page.goto("/admin/empresas/nuevo");
		await page.getByLabel("Nombre", { exact: true }).fill(name);
		await page.getByRole("button", { name: "Guardar" }).click();
		await expect(page.locator('p[role="alert"]')).toHaveText(
			"Ya existe una empresa con ese nombre o slug.",
		);
		const duplicates = await service
			.from("companies")
			.select("id")
			.eq("name", name);
		expect(duplicates.data).toHaveLength(1);

		// Un nombre demasiado corto lo rechaza el servidor, no se guarda en silencio.
		await page.goto("/admin/empresas/nuevo");
		await page.getByLabel("Nombre", { exact: true }).fill("X");
		await page.getByRole("button", { name: "Guardar" }).click();
		await expect(page.locator('p[role="alert"]')).toHaveText(
			"Revisa los campos obligatorios y sus formatos.",
		);
		expect(
			(await service.from("companies").select("id").eq("name", "X")).data,
		).toHaveLength(0);

		// El borrado pide confirmación y cancelarla no borra nada.
		await page.goto("/admin/empresas");
		const row = page.getByRole("row").filter({ hasText: name });
		page.once("dialog", (dialog) => {
			expect(dialog.message()).toContain(name);
			dialog.dismiss();
		});
		await row.getByRole("button", { name: "Eliminar" }).click();
		await expect(page.getByRole("row").filter({ hasText: name })).toHaveCount(
			1,
		);

		page.once("dialog", (dialog) => dialog.accept());
		await page
			.getByRole("row")
			.filter({ hasText: name })
			.getByRole("button", { name: "Eliminar" })
			.click();
		await expect(page.getByRole("status")).toHaveText("Empresa eliminada.");
		await expect(page.getByRole("row").filter({ hasText: name })).toHaveCount(
			0,
		);
		expect(
			(await service.from("companies").select("id").eq("name", name)).data,
		).toHaveLength(0);
	} finally {
		const removed = await service.from("companies").delete().eq("name", name);
		expect.soft(removed.error).toBeNull();
		await deleteTestUser(admin.id);
	}
});

test("índices: alta, duplicado rechazado y borrado confirmado", async ({
	page,
}) => {
	const run = randomUUID().slice(0, 8);
	const name = `IDX ${run}`;
	const admin = await createTestUser(`cms-indices-${run}@example.test`, true);
	try {
		await signInPage(page, admin.email ?? "", "/admin");
		await page.goto("/admin/indices");
		const addForm = page
			.locator("form")
			.filter({ has: page.getByRole("button", { name: "Añadir" }) });
		await addForm.getByLabel("Nombre").fill(name);
		await addForm.getByLabel("Valor").fill("1234.56");
		await addForm.getByLabel("Variación", { exact: true }).fill("-2.5");
		await addForm.getByRole("button", { name: "Añadir" }).click();
		await expect(page.getByRole("status")).toHaveText("Índice añadido.");

		const created = await service
			.from("indices")
			.select("id, value, change")
			.eq("name", name)
			.single();
		expect(created.error).toBeNull();
		expect(Number(created.data?.value)).toBe(1234.56);
		expect(Number(created.data?.change)).toBe(-2.5);

		// El nombre es único: repetirlo devuelve el error del proveedor de datos.
		await addForm.getByLabel("Nombre").fill(name);
		await addForm.getByLabel("Valor").fill("10");
		await addForm.getByRole("button", { name: "Añadir" }).click();
		await expect(page.locator('p[role="alert"]')).toHaveText(
			"Ya existe un índice con ese nombre.",
		);
		expect(
			(await service.from("indices").select("id").eq("name", name)).data,
		).toHaveLength(1);

		// Un nombre inaceptable para el servidor no se guarda ni se anuncia como éxito.
		await addForm.getByLabel("Nombre").fill("N".repeat(200));
		await addForm.getByLabel("Valor").fill("10");
		await addForm.getByRole("button", { name: "Añadir" }).click();
		await expect(page.locator('p[role="alert"]')).toHaveText(
			"Revisa el nombre y el valor: son obligatorios y numéricos.",
		);

		page.once("dialog", (dialog) => {
			expect(dialog.message()).toContain(name);
			dialog.dismiss();
		});
		const row = page
			.locator("form")
			.filter({ has: page.locator(`input[value="${name}"]`) });
		await row.getByRole("button", { name: "Eliminar" }).click();
		expect(
			(await service.from("indices").select("id").eq("name", name)).data,
		).toHaveLength(1);

		page.once("dialog", (dialog) => dialog.accept());
		await row.getByRole("button", { name: "Eliminar" }).click();
		await expect(page.getByRole("status")).toHaveText("Índice eliminado.");
		expect(
			(await service.from("indices").select("id").eq("name", name)).data,
		).toHaveLength(0);
	} finally {
		const removed = await service.from("indices").delete().eq("name", name);
		expect.soft(removed.error).toBeNull();
		await deleteTestUser(admin.id);
	}
});

test("empresa inexistente devuelve 404 y una consulta fallida muestra el error de sección", async ({
	page,
}) => {
	const run = randomUUID().slice(0, 8);
	const admin = await createTestUser(`cms-404-${run}@example.test`, true);
	try {
		await signInPage(page, admin.email ?? "", "/admin");
		const missing = await page.goto(`/admin/empresas/${randomUUID()}`);
		expect(missing?.status()).toBe(404);
		await expect(page.getByText("Sin empresas en el directorio.")).toHaveCount(
			0,
		);

		// Un identificador malformado hace fallar la consulta: la vista lo declara
		// como fallo de carga en vez de fingir un registro vacío.
		await page.goto("/admin/empresas/no-es-un-uuid");
		await expect(
			page.getByRole("heading", { name: "No se pudo cargar esta sección" }),
		).toBeVisible();
		await expect(
			page.getByRole("button", { name: "Reintentar" }),
		).toBeVisible();
	} finally {
		await deleteTestUser(admin.id);
	}
});
