import { randomUUID } from "node:crypto";
import { expect, test } from "@playwright/test";
import { createTestUser, deleteTestUser, service, signInPage } from "./local";

const alert = 'p[role="alert"]';

test("categorías: alta, edición, duplicado rechazado y borrado bloqueado mientras estén en uso", async ({
	page,
}) => {
	const run = randomUUID().slice(0, 8);
	const name = `Categoría ${run}`;
	const renamed = `Categoría renombrada ${run}`;
	const admin = await createTestUser(`cat-admin-${run}@example.test`, true);
	const slug = `categoria-${run}`;
	try {
		await signInPage(page, admin.email ?? "", "/admin");
		await page.goto("/admin/categorias");

		const addForm = page
			.locator("form")
			.filter({ has: page.getByRole("button", { name: "Añadir" }) });
		await addForm.getByLabel("Nombre").fill(name);
		await addForm.getByLabel("Slug").fill(slug);
		await addForm.getByLabel("Descripción").fill("Taxonomía sintética E2E.");
		await addForm.getByRole("button", { name: "Añadir" }).click();
		await expect(page.getByRole("status")).toHaveText("Categoría creada.");

		const created = await service
			.from("categories")
			.select("id, slug, description")
			.eq("name", name)
			.single();
		expect(created.error).toBeNull();
		expect(created.data?.slug).toBe(slug);

		// El nombre es único: repetirlo devuelve el motivo, no un falso éxito.
		await addForm.getByLabel("Nombre").fill(name);
		await addForm.getByRole("button", { name: "Añadir" }).click();
		await expect(page.locator(alert)).toHaveText(
			"Ya existe una categoría con ese nombre o slug.",
		);
		expect(
			(await service.from("categories").select("id").eq("name", name)).data,
		).toHaveLength(1);

		// Edición en línea desde la propia fila.
		const row = page.getByRole("row").filter({ hasText: slug });
		await row.getByLabel(`Nombre de ${name}`).fill(renamed);
		await row.getByRole("button", { name: "Guardar" }).click();
		await expect(page.getByRole("status")).toHaveText("Categoría actualizada.");
		expect(
			(
				await service
					.from("categories")
					.select("name")
					.eq("id", created.data?.id ?? "")
			).data?.[0]?.name,
		).toBe(renamed);

		// Con un artículo asignado, el borrado se rechaza y se explica.
		const article = await service
			.from("articles")
			.insert({
				title: `Artículo de categoría ${run}`,
				slug: `articulo-categoria-${run}`,
				type: "noticia",
				status: "borrador",
				content: "Cuerpo sintético.",
				author_id: admin.id,
				category_id: created.data?.id,
			})
			.select("id")
			.single();
		expect(article.error).toBeNull();

		await page.goto("/admin/categorias");
		const usedRow = page.getByRole("row").filter({ hasText: slug });
		await expect(usedRow).toContainText("En uso");
		await expect(usedRow.getByRole("button", { name: "Eliminar" })).toHaveCount(
			0,
		);

		// Sin artículos, el borrado pide confirmación y solo entonces ocurre.
		await service
			.from("articles")
			.delete()
			.eq("id", article.data?.id ?? "");
		await page.goto("/admin/categorias");
		const freeRow = page.getByRole("row").filter({ hasText: slug });
		page.once("dialog", (dialog) => {
			expect(dialog.message()).toContain(renamed);
			dialog.dismiss();
		});
		await freeRow.getByRole("button", { name: "Eliminar" }).click();
		expect(
			(await service.from("categories").select("id").eq("slug", slug)).data,
		).toHaveLength(1);

		page.once("dialog", (dialog) => dialog.accept());
		await page
			.getByRole("row")
			.filter({ hasText: slug })
			.getByRole("button", { name: "Eliminar" })
			.click();
		await expect(page.getByRole("status")).toHaveText("Categoría eliminada.");
		expect(
			(await service.from("categories").select("id").eq("slug", slug)).data,
		).toHaveLength(0);
	} finally {
		await service
			.from("articles")
			.delete()
			.eq("slug", `articulo-categoria-${run}`);
		const removed = await service.from("categories").delete().eq("slug", slug);
		expect.soft(removed.error).toBeNull();
		await deleteTestUser(admin.id);
	}
});

test("usuarios: promoción, retirada del rol, búsqueda y protección de la propia cuenta", async ({
	page,
	browser,
}) => {
	const run = randomUUID().slice(0, 8);
	const admin = await createTestUser(`roles-admin-${run}@example.test`, true);
	const student = await createTestUser(`roles-user-${run}@example.test`);
	const other = await browser.newPage({ baseURL: "http://127.0.0.1:3100" });
	try {
		await signInPage(page, admin.email ?? "", "/admin");
		await page.goto(
			`/admin/usuarios?q=${encodeURIComponent(student.email ?? "")}`,
		);
		const row = page.getByRole("row").filter({ hasText: student.email ?? "" });
		await expect(row).toContainText("Usuario");

		// La búsqueda acota el listado a la cuenta pedida.
		await expect(page.getByRole("row")).toHaveCount(2);

		page.once("dialog", (dialog) => {
			expect(dialog.message()).toContain(student.email ?? "");
			dialog.accept();
		});
		await row.getByRole("button", { name: "Hacer administrador" }).click();
		await expect(page.getByRole("status")).toHaveText(
			"La cuenta ahora es administradora.",
		);
		expect(
			(await service.from("profiles").select("role").eq("id", student.id))
				.data?.[0]?.role,
		).toBe("admin");

		// El rol nuevo abre el panel de verdad.
		await signInPage(other, student.email ?? "", "/admin");
		await expect(
			other.getByRole("heading", { name: "Resumen", exact: true }),
		).toBeVisible();

		// Y retirarlo lo cierra otra vez.
		await page.goto(
			`/admin/usuarios?q=${encodeURIComponent(student.email ?? "")}`,
		);
		page.once("dialog", (dialog) => dialog.accept());
		await page
			.getByRole("row")
			.filter({ hasText: student.email ?? "" })
			.getByRole("button", { name: "Quitar administrador" })
			.click();
		await expect(page.getByRole("status")).toHaveText(
			"La cuenta ya no es administradora.",
		);
		await other.goto("/admin");
		await expect(other).toHaveURL((url) => url.pathname === "/cuenta");

		// La propia cuenta no ofrece cambio de rol: el panel nunca queda sin admin.
		await page.goto(
			`/admin/usuarios?q=${encodeURIComponent(admin.email ?? "")}`,
		);
		const selfRow = page
			.getByRole("row")
			.filter({ hasText: admin.email ?? "" });
		await expect(selfRow).toContainText("Tu propia cuenta");
		await expect(selfRow.getByRole("button")).toHaveCount(0);

		// Una búsqueda sin resultados explica el vacío en vez de romperse.
		await page.goto("/admin/usuarios?q=inexistente-en-el-padron");
		await expect(
			page.getByText("Ninguna cuenta coincide con esa búsqueda."),
		).toBeVisible();
	} finally {
		await other.close();
		await deleteTestUser(student.id);
		await deleteTestUser(admin.id);
	}
});

test("un usuario sin rol no alcanza la gestión de categorías ni la de roles", async ({
	page,
	browser,
}) => {
	const run = randomUUID().slice(0, 8);
	const student = await createTestUser(`roles-guest-${run}@example.test`);
	const visitor = await browser.newPage({ baseURL: "http://127.0.0.1:3100" });
	try {
		await signInPage(page, student.email ?? "", "/cuenta");
		for (const path of ["/admin/categorias", "/admin/usuarios"]) {
			await page.goto(path);
			await expect(page, path).toHaveURL((url) => url.pathname === "/cuenta");
			await visitor.goto(path);
			await expect(visitor, path).toHaveURL((url) => url.pathname === "/login");
		}
		// Y su rol sigue intacto tras los intentos.
		expect(
			(await service.from("profiles").select("role").eq("id", student.id))
				.data?.[0]?.role,
		).toBe("usuario");
	} finally {
		await visitor.close();
		await deleteTestUser(student.id);
	}
});
