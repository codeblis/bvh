"use client";

import { PublicModuleError } from "@/components/bvh/PublicModuleError";

export default function NoticiasError({ reset }: { reset: () => void }) {
	return <PublicModuleError reset={reset} title="las noticias" />;
}
