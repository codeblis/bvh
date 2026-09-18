import { Info } from "lucide-react";
import type { ReactNode } from "react";

const DEFAULT_MESSAGE: ReactNode = (
	<>
		<strong className="text-foreground">
			Sección en preparación, aún no disponible.
		</strong>{" "}
		Los índices, cotizaciones y empresas que ves son datos simulados para
		validar la experiencia; no son información bursátil ni una oferta de
		inversión.
	</>
);

export function DemoNotice({
	compact = false,
	message = DEFAULT_MESSAGE,
}: {
	compact?: boolean;
	message?: ReactNode;
}) {
	return (
		<div className="border-b border-primary/20 bg-primary/5">
			<div
				className={`mx-auto flex max-w-7xl items-start gap-2 px-6 text-muted-foreground ${compact ? "py-2 text-[10px]" : "py-3 text-xs"}`}
			>
				<Info
					className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary"
					aria-hidden="true"
				/>
				<p>{message}</p>
			</div>
		</div>
	);
}
