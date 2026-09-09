"use client";

import { useRef, useTransition } from "react";

export function StatusSelect({
	action,
	id,
	current,
	options,
}: {
	action: (formData: FormData) => Promise<void>;
	id: string;
	current: string;
	options: readonly string[];
}) {
	const formRef = useRef<HTMLFormElement>(null);
	const [pending, startTransition] = useTransition();

	return (
		<form ref={formRef} action={action}>
			<input type="hidden" name="id" value={id} />
			<select
				name="status"
				defaultValue={current}
				disabled={pending}
				onChange={() => {
					startTransition(() => formRef.current?.requestSubmit());
				}}
				className="rounded-lg border border-border/80 bg-background/60 px-2.5 py-1.5 text-xs text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 disabled:opacity-50"
			>
				{options.map((o) => (
					<option key={o} value={o}>
						{o}
					</option>
				))}
			</select>
		</form>
	);
}
