"use client";

import { PublicModuleError } from "@/components/bvh/PublicModuleError";

export default function InstitutoError({ reset }: { reset: () => void }) {
	return <PublicModuleError reset={reset} title="los cursos" />;
}
