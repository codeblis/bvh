"use client";

import type { ComponentProps, MouseEvent, ReactNode } from "react";

export function ConfirmSubmitButton({
	children,
	message,
	className,
	formAction,
}: {
	children: ReactNode;
	message: string;
	className?: string;
	formAction?: ComponentProps<"button">["formAction"];
}) {
	function confirmSubmit(event: MouseEvent<HTMLButtonElement>) {
		if (!window.confirm(message)) event.preventDefault();
	}

	return (
		<button
			type="submit"
			onClick={confirmSubmit}
			className={className}
			formAction={formAction}
			formNoValidate={Boolean(formAction)}
		>
			{children}
		</button>
	);
}
