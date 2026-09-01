import { requireAdmin } from "@/lib/admin";
import { AdminPageHeader, EmptyState, card } from "../_ui";
import { deleteIndex, saveIndex } from "./actions";

const numberInput =
	"w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm focus:border-primary focus:outline-none";

export default async function IndicesPage() {
	const { supabase } = await requireAdmin();
	const { data } = await supabase
		.from("indices")
		.select("*")
		.order("name", { ascending: true });
	const rows = data ?? [];

	return (
		<div>
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
								<button
									type="submit"
									formAction={deleteIndex}
									className="rounded-md border border-border px-3 py-1.5 text-xs text-destructive hover:border-destructive"
								>
									Eliminar
								</button>
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
