import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
	if (!supabaseUrl || !supabaseKey) return NextResponse.next();

	let response = NextResponse.next({ request });
	const supabase = createServerClient(supabaseUrl, supabaseKey, {
		cookies: {
			getAll: () => request.cookies.getAll(),
			setAll(cookiesToSet) {
				cookiesToSet.forEach(({ name, value }) => { request.cookies.set(name, value); });
				response = NextResponse.next({ request });
				cookiesToSet.forEach(({ name, value, options }) => { response.cookies.set(name, value, options); });
			},
		},
	});

	const { data: { user } } = await supabase.auth.getUser();
	if ((request.nextUrl.pathname.startsWith("/admin") || request.nextUrl.pathname.startsWith("/cuenta")) && !user) {
		const url = request.nextUrl.clone();
		url.pathname = "/login";
		url.searchParams.set("callbackUrl", request.nextUrl.pathname);
		return NextResponse.redirect(url);
	}
	return response;
}

export const config = {
	runtime: "experimental-edge",
	matcher: ["/admin/:path*", "/cuenta/:path*"],
};
