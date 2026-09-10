"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

type TurnstileApi = {
	render: (
		element: HTMLElement,
		options: {
			sitekey: string;
			theme?: string;
			callback: (token: string) => void;
			"expired-callback": () => void;
			"error-callback": () => void;
		},
	) => string;
};

declare global {
	interface Window {
		turnstile?: TurnstileApi;
	}
}

/**
 * Widget de verificación. Sin clave pública configurada no renderiza nada y el
 * formulario funciona como siempre: la protección se activa con la clave, no
 * con un despliegue distinto.
 */
export function TurnstileField({
	onToken,
}: {
	onToken: (token: string) => void;
}) {
	const container = useRef<HTMLDivElement>(null);
	const [ready, setReady] = useState(false);
	const rendered = useRef(false);

	useEffect(() => {
		if (!SITE_KEY || !ready || rendered.current) return;
		const api = window.turnstile;
		if (!api || !container.current) return;
		rendered.current = true;
		api.render(container.current, {
			sitekey: SITE_KEY,
			theme: "dark",
			callback: (token) => onToken(token),
			"expired-callback": () => onToken(""),
			"error-callback": () => onToken(""),
		});
	}, [ready, onToken]);

	if (!SITE_KEY) return null;

	return (
		<div>
			<Script
				src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
				strategy="lazyOnload"
				onLoad={() => setReady(true)}
			/>
			<div ref={container} />
		</div>
	);
}
