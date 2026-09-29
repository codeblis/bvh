"use client";

import { PublicModuleError } from "@/components/bvh/PublicModuleError";

export default function BlogError({ reset }: { reset: () => void }) {
	return <PublicModuleError reset={reset} title="el blog" />;
}
