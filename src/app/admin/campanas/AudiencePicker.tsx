"use client";

import { useState } from "react";
import { Field } from "../_ui";

type Option = { value: string; label: string };

// La audiencia decide la naturaleza del correo, así que se elige primero y el
// resto del formulario se adapta. Enseñar los dos grupos a la vez invitaba a
// rellenar el equivocado.
export function AudiencePicker({
	lists,
	offerings,
	defaultKind = "lista",
	defaultListId,
	defaultOfferingId,
	defaultScope,
	form,
}: {
	lists: Option[];
	offerings: Option[];
	defaultKind?: "lista" | "curso";
	defaultListId?: string | null;
	defaultOfferingId?: string | null;
	defaultScope?: string | null;
	form?: string;
}) {
	const [kind, setKind] = useState<"lista" | "curso">(defaultKind);

	return (
		<div className="space-y-4">
			<div>
				<label
					htmlFor="audience_kind"
					className="mb-1.5 block text-[13px] font-medium text-foreground"
				>
					Audiencia
				</label>
				<select
					id="audience_kind"
					name="audience_kind"
					form={form}
					value={kind}
					onChange={(event) =>
						setKind(event.target.value as "lista" | "curso")
					}
					className="w-full rounded-md border border-border bg-background px-3 py-2 text-[13px]"
				>
					<option value="lista">Lista del boletín (consentimiento)</option>
					<option value="curso">Audiencia de un curso (operativo)</option>
				</select>
				<p className="mt-1.5 text-xs text-muted-foreground">
					{kind === "lista"
						? "Va a quien consintió esa lista y no tiene baja global. Incluye enlace de baja."
						: "Va a quien tiene inscripción o plaza en espera en esa edición. Es un aviso sobre su curso, no un boletín: no lleva enlace de baja."}
				</p>
			</div>

			{kind === "lista" ? (
				<div>
					<label
						htmlFor="list_id"
						className="mb-1.5 block text-[13px] font-medium text-foreground"
					>
						Lista
					</label>
					<select
						id="list_id"
						name="list_id"
						form={form}
						defaultValue={defaultListId ?? ""}
						className="w-full rounded-md border border-border bg-background px-3 py-2 text-[13px]"
						required
					>
						<option value="">Elige una lista…</option>
						{lists.map((list) => (
							<option key={list.value} value={list.value}>
								{list.label}
							</option>
						))}
					</select>
				</div>
			) : (
				<div className="grid gap-4 sm:grid-cols-2">
					<div>
						<label
							htmlFor="offering_id"
							className="mb-1.5 block text-[13px] font-medium text-foreground"
						>
							Edición
						</label>
						<select
							id="offering_id"
							name="offering_id"
							form={form}
							defaultValue={defaultOfferingId ?? ""}
							className="w-full rounded-md border border-border bg-background px-3 py-2 text-[13px]"
							required
						>
							<option value="">Elige una edición…</option>
							{offerings.map((offering) => (
								<option key={offering.value} value={offering.value}>
									{offering.label}
								</option>
							))}
						</select>
					</div>
					<Field
						label="Destinatarios"
						name="offering_scope"
						form={form}
						defaultValue={defaultScope ?? "inscritos"}
						options={["inscritos", "lista_espera", "todos"]}
						optionLabels={{
							inscritos: "Inscritos",
							lista_espera: "Lista de espera",
							todos: "Inscritos y lista de espera",
						}}
					/>
				</div>
			)}
		</div>
	);
}
