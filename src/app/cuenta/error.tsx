"use client";

import { PublicModuleError } from "@/components/bvh/PublicModuleError";

export default function AccountError({ reset }: { reset: () => void }) {
	return <PublicModuleError reset={reset} title="tu cuenta" />;
}
