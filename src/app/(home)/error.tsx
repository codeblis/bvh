"use client";

import { PublicModuleError } from "@/components/bvh/PublicModuleError";

export default function HomeError({ reset }: { reset: () => void }) {
	return <PublicModuleError reset={reset} title="la portada" />;
}
