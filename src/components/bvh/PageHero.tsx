"use client";

import type { ReactNode } from "react";

export function PageHero({
	eyebrow,
	title,
	description,
	children,
}: {
	eyebrow: string;
	title: ReactNode;
	description?: ReactNode;
	children?: ReactNode;
}) {
	return (
		<section
			className="relative overflow-hidden border-b border-border"
			style={{ background: "var(--gradient-hero)" }}
		>
			<div
				className="pointer-events-none absolute inset-0 opacity-[0.06]"
				style={{
					backgroundImage:
						"linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)",
					backgroundSize: "56px 56px",
				}}
			/>
			<div className="relative mx-auto max-w-7xl px-6 py-10 md:py-10 fade-up">
				<div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-primary">
					<span className="h-1 w-1 rounded-full bg-primary" /> {eyebrow}
				</div>
				<h1 className="max-w-6xl font-serif text-[36px] font-semibold leading-[1.05] tracking-tight text-foreground md:text-[56px]">
					{title}
				</h1>
				{description && (
					<p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
						{description}
					</p>
				)}
				{children && <div className="mt-8">{children}</div>}
			</div>
		</section>
	);
}
