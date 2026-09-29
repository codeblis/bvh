import { defineConfig } from "@playwright/test";
import base from "./playwright.config";

/**
 * Tanda del MVP editorial. Necesita su propio build porque
 * `NEXT_PUBLIC_MVP_EDITORIAL` se incrusta al construir: el mismo servidor no
 * puede servir a la vez el sitio completo y el recortado.
 *
 * Se lanza con `pnpm test:e2e:mvp`, que exporta la bandera antes de construir.
 */
export default defineConfig({
	...base,
	testMatch: "**/*.mvp-e2e.ts",
});
