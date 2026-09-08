import type { ReactNode } from "react";

export const card = "rounded-xl border border-border bg-card/60 p-4 sm:p-5";
export const tableWrap = "overflow-x-auto rounded-xl border border-border";
export const table = "w-full text-left text-[13px]";
export const th =
	"whitespace-nowrap border-b border-border bg-secondary/30 px-3 py-2 font-medium text-muted-foreground";
export const td = "border-b border-border/60 px-3 py-2 align-top";

const inputCls =
	"mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none";

export function AdminPageHeader({
	title,
	description,
	action,
}: {
	title: string;
	description?: string;
	action?: ReactNode;
}) {
	return (
		<div className="mb-6 flex flex-wrap items-start justify-between gap-4">
			<div>
				<h1 className="font-serif text-2xl">{title}</h1>
				{description ? (
					<p className="mt-1 text-sm text-muted-foreground">{description}</p>
				) : null}
			</div>
			{action}
		</div>
	);
}

export function EmptyState({ children }: { children: ReactNode }) {
	return (
		<div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
			{children}
		</div>
	);
}

export function Field({
	label,
	name,
	defaultValue,
	type = "text",
	required,
	placeholder,
	textarea,
	options,
	hint,
	step,
}: {
	label: string;
	name: string;
	defaultValue?: string | number | null;
	type?: string;
	required?: boolean;
	placeholder?: string;
	textarea?: boolean;
	options?: readonly string[];
	hint?: string;
	step?: string;
}) {
	return (
		<label htmlFor={name} className="block text-[13px]">
			<span className="font-medium text-foreground">{label}</span>
			{options ? (
				<select
					id={name}
					name={name}
					defaultValue={defaultValue ?? ""}
					className={inputCls}
					required={required}
				>
					{options.map((o) => (
						<option key={o} value={o}>
							{o}
						</option>
					))}
				</select>
			) : textarea ? (
				<textarea
					id={name}
					name={name}
					defaultValue={defaultValue ?? ""}
					rows={8}
					placeholder={placeholder}
					className={inputCls}
					required={required}
				/>
			) : (
				<input
					id={name}
					name={name}
					type={type}
					step={step}
					defaultValue={defaultValue ?? ""}
					placeholder={placeholder}
					className={inputCls}
					required={required}
				/>
			)}
			{hint ? (
				<span className="mt-1 block text-xs text-muted-foreground">{hint}</span>
			) : null}
		</label>
	);
}

export function SaveButton({ children = "Guardar" }: { children?: ReactNode }) {
	return (
		<button
			type="submit"
			className="rounded-md bg-primary px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-primary-foreground transition hover:brightness-110"
		>
			{children}
		</button>
	);
}

export function FormBanner({
	error,
	success,
	errorMessages,
	successMessages,
}: {
	error?: string;
	success?: string;
	errorMessages: Record<string, string>;
	successMessages: Record<string, string>;
}) {
	if (error) {
		return (
			<p
				className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
				role="alert"
			>
				{errorMessages[error] ?? "No se pudo completar la operación."}
			</p>
		);
	}
	if (success) {
		return (
			<p
				className="mb-4 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400"
				role="status"
			>
				{successMessages[success] ?? "Operación completada."}
			</p>
		);
	}
	return null;
}
