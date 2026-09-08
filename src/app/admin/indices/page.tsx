import { requireAdmin } from "@/lib/admin";
import { AdminPageHeader, card, EmptyState, FormBanner } from "../_ui";
import { ConfirmSubmitButton } from "../ConfirmSubmitButton";
import { deleteIndex, saveIndex } from "./actions";

const errorMessages: Record<string, string> = {
	invalid: "Revisa el nombre y el valor: son obligatorios y numéricos.",
	save: "No se pudo guardar el índice. Inténtalo nuevamente.",
	duplicate: "Ya existe un índice con ese nombre.",
	delete: "No se pudo eliminar el índice. Inténtalo nuevamente.",
	"not-found": "Ese índice ya no existe.",
};

const successMessages: Record<string, string> = {
	created: "Índice añadido.",
	updated: "Índice actualizado.",
	deleted: "Índice eliminado.",
};

const numberInput =
	"w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm focus:border-primary focus:outline-none";

export default async function IndicesPage({
	searchParams,
}: {
	searchParams: Promise<{ error?: string; saved?: string }>;
}) {
	const query = await searchParams;
	const { supabase } = await requireAdmin();
	const { data, error } = await supabase
		.from("indices")
		.select("*")
		.order("name", { ascending: true });
	if (error)
		throw new Error(`No se pudieron cargar los índices: ${error.message}`);
	const rows = data ?? [];

	return (
		<div>
			<FormBanner
				error={query.error}
				success={query.saved}
				errorMessages={errorMessages}
				successMessages={successMessages}
			/>
			<AdminPageHeader
				title="Índices"
				description="Valores mostrados en la página pública de índices."
			/>

			<div className="space-y-3">
				{rows.length === 0 ? (
					<EmptyState>Sin índices. Añade el primero abajo.</EmptyState>
				) : (
					rows.map((r) => (
						<form
							key={r.id}
							action={saveIndex}
							className={`${card} grid items-end gap-3 sm:grid-cols-[1.5fr_1fr_1fr_1fr_auto]`}
						>
							<input type="hidden" name="id" value={r.id} />
							<label className="text-[12px]">
								<span className="text-muted-foreground">Nombre</span>
								<input
									name="name"
									defaultValue={r.name}
									required
									className={numberInput}
								/>
							</label>
							<label className="text-[12px]">
								<span className="text-muted-foreground">Valor</span>
								<input
									name="value"
									type="number"
									step="0.01"
									defaultValue={r.value}
									required
									className={numberInput}
								/>
							</label>
							<label className="text-[12px]">
								<span className="text-muted-foreground">Variación</span>
								<input
									name="change"
									type="number"
									step="0.01"
									defaultValue={r.change ?? ""}
									className={numberInput}
								/>
							</label>
							<label className="text-[12px]">
								<span className="text-muted-foreground">Variación %</span>
								<input
									name="change_percent"
									type="number"
									step="0.01"
									defaultValue={r.change_percent ?? ""}
									className={numberInput}
								/>
							</label>
							<div className="flex gap-2">
								<button
									type="submit"
									className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
								>
									Guardar
								</button>
								<ConfirmSubmitButton
									formAction={deleteIndex}
									message={`Eliminar el índice «${r.name}». Esta acción no se puede deshacer.`}
									className="rounded-md border border-border px-3 py-1.5 text-xs text-destructive hover:border-destructive"
								>
									Eliminar
								</ConfirmSubmitButton>
							</div>
						</form>
					))
				)}
			</div>

			<div className="mt-8">
				<h2 className="mb-3 font-serif text-lg">Añadir índice</h2>
				<form
					action={saveIndex}
					className={`${card} grid items-end gap-3 sm:grid-cols-[1.5fr_1fr_1fr_1fr_auto]`}
				>
					<label className="text-[12px]">
						<span className="text-muted-foreground">Nombre</span>
						<input name="name" required className={numberInput} />
					</label>
					<label className="text-[12px]">
						<span className="text-muted-foreground">Valor</span>
						<input
							name="value"
							type="number"
							step="0.01"
							required
							className={numberInput}
						/>
					</label>
					<label className="text-[12px]">
						<span className="text-muted-foreground">Variación</span>
						<input
							name="change"
							type="number"
							step="0.01"
							className={numberInput}
						/>
					</label>
					<label className="text-[12px]">
						<span className="text-muted-foreground">Variación %</span>
						<input
							name="change_percent"
							type="number"
							step="0.01"
							className={numberInput}
						/>
					</label>
					<button
						type="submit"
						className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
					>
						Añadir
					</button>
				</form>
			</div>
		</div>
	);
}
