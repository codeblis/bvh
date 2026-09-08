import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSafeAuthRedirect } from "@/lib/safe-redirect";
import { getAuthSiteOrigin } from "@/modules/identity/site-url";

export async function GET(request: Request) {
	const url = new URL(request.url);
	const code = url.searchParams.get("code");
	const next = getSafeAuthRedirect(url.searchParams.get("next"));
	let origin: string;
	try {
		origin = getAuthSiteOrigin();
	} catch {
		return new Response("La autenticación no está disponible.", {
			status: 503,
			headers: { "Cache-Control": "no-store" },
		});
	}
	function redirect(path: string) {
		const response = NextResponse.redirect(new URL(path, origin));
		response.headers.set("Cache-Control", "no-store");
		return response;
	}

	if (code) {
		try {
			const supabase = await createClient();
			const { error } = await supabase.auth.exchangeCodeForSession(code);
			if (!error) return redirect(next);
		} catch {
			/* Provider details must not reach the callback response. */
		}
	}

	return redirect("/login?error=callback");
}
