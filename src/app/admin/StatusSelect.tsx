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
				className="rounded-md border border-border bg-background px-2 py-1 text-xs disabled:opacity-50"
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
