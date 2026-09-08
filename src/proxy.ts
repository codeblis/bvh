import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/supabase";
import { getAuthSiteOrigin } from "@/modules/identity/site-url";

export async function proxy(request: NextRequest) {
	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
	if (!supabaseUrl || !supabaseKey) return NextResponse.next();

	let response = NextResponse.next({ request });
	const supabase = createServerClient<Database>(supabaseUrl, supabaseKey, {
		cookies: {
			getAll: () => request.cookies.getAll(),
			setAll(cookiesToSet) {
				cookiesToSet.forEach(({ name, value }) => {
					request.cookies.set(name, value);
				});
				response = NextResponse.next({ request });
				cookiesToSet.forEach(({ name, value, options }) => {
					response.cookies.set(name, value, options);
				});
			},
		},
	});

	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (
		(request.nextUrl.pathname.startsWith("/admin") ||
			request.nextUrl.pathname.startsWith("/cuenta")) &&
		!user
	) {
		let origin: string;
		try {
			origin = getAuthSiteOrigin();
		} catch {
			return new NextResponse("La autenticación no está disponible.", {
				status: 503,
				headers: { "Cache-Control": "no-store" },
			});
		}
		const url = new URL("/login", origin);
		url.searchParams.set("callbackUrl", request.nextUrl.pathname);
		const redirected = NextResponse.redirect(url);
		for (const cookie of response.cookies.getAll())
			redirected.cookies.set(cookie);
		redirected.headers.set("Cache-Control", "no-store");
		return redirected;
	}
	return response;
}

export const config = {
	matcher: ["/admin/:path*", "/cuenta/:path*"],
};
