import type { ReactNode } from "react";

// El panel es una mesa de trabajo: retículas finas, cifras tabulares y el
// dorado reservado a la acción principal y a la sección activa.
export const card = "rounded-xl border border-border bg-card/60 p-4 sm:p-5";
export const panel =
	"rounded-xl border border-border/70 bg-card/40 backdrop-blur-sm";
export const tableWrap =
	"overflow-x-auto rounded-xl border border-border/70 bg-card/30";
export const table = "w-full text-left text-[13px]";
export const th =
	"whitespace-nowrap border-b border-border px-4 py-3 font-medium text-[11px] text-muted-foreground";
export const td = "border-b border-border/40 px-4 py-3 align-top";
export const num = "tabular-nums";

const inputBase =
	"w-full rounded-lg border border-border/80 bg-background/60 px-3 py-2.5 text-sm text-foreground transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/25";

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
		<div className="mb-7 flex flex-wrap items-end justify-between gap-4 border-b border-border/60 pb-5">
			<div className="min-w-0">
				<h1 className="font-serif text-[26px] leading-tight sm:text-[30px]">
					{title}
				</h1>
				{description ? (
					<p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-muted-foreground">
						{description}
					</p>
				) : null}
			</div>
			{action}
		</div>
	);
}

export function EmptyState({
	children,
	action,
}: {
	children: ReactNode;
	action?: ReactNode;
}) {
	return (
		<div className="rounded-xl border border-dashed border-border bg-card/20 px-6 py-12 text-center">
			<p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
				{children}
			</p>
			{action ? <div className="mt-5">{action}</div> : null}
		</div>
	);
}

const flagTones = {
	activo: "border-primary/35 bg-primary/10 text-primary",
	hecho: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
	espera: "border-amber-400/30 bg-amber-400/10 text-amber-300",
	fallo: "border-destructive/40 bg-destructive/10 text-destructive",
	neutro: "border-border bg-secondary/40 text-muted-foreground",
} as const;

export type FlagTone = keyof typeof flagTones;

export function Flag({
	children,
	tone = "neutro",
}: {
	children: ReactNode;
	tone?: FlagTone;
}) {
	return (
		<span
			className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border px-2 py-0.5 text-[11px] font-medium ${flagTones[tone]}`}
		>
			{children}
		</span>
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
	rows = 8,
	options,
	hint,
	step,
	className,
	form,
}: {
	label: string;
	name: string;
	defaultValue?: string | number | null;
	type?: string;
	required?: boolean;
	placeholder?: string;
	textarea?: boolean;
	rows?: number;
	options?: readonly string[];
	hint?: string;
	step?: string;
	className?: string;
	form?: string;
}) {
	return (
		<div className={className}>
			<label
				htmlFor={name}
				className="mb-1.5 block text-[13px] font-medium text-foreground"
			>
				{label}
			</label>
			{options ? (
				<select
					id={name}
					name={name}
					form={form}
					defaultValue={defaultValue ?? ""}
					className={inputBase}
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
					form={form}
					defaultValue={defaultValue ?? ""}
					rows={rows}
					placeholder={placeholder}
					className={`${inputBase} leading-relaxed`}
					required={required}
				/>
			) : (
				<input
					id={name}
					name={name}
					form={form}
					type={type}
					step={step}
					defaultValue={defaultValue ?? ""}
					placeholder={placeholder}
					className={inputBase}
					required={required}
				/>
			)}
			{hint ? (
				<p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
					{hint}
				</p>
			) : null}
		</div>
	);
}

export const buttonPrimary =
	"inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[13px] font-semibold text-primary-foreground transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background";
export const buttonGhost =
	"inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-[13px] font-medium text-foreground transition hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40";
export const buttonQuiet =
	"inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition hover:bg-secondary/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40";

export function SaveButton({
	children = "Guardar",
	full,
	form,
}: {
	children?: ReactNode;
	full?: boolean;
	form?: string;
}) {
	return (
		<button
			type="submit"
			form={form}
			className={`${buttonPrimary}${full ? " w-full" : ""}`}
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
				className="mb-5 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
				role="alert"
			>
				{errorMessages[error] ?? "No se pudo completar la operación."}
			</p>
		);
	}
	if (success) {
		return (
			<p
				className="mb-5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400"
				role="status"
			>
				{successMessages[success] ?? "Operación completada."}
			</p>
		);
	}
	return null;
}
