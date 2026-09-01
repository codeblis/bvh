import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const configured = () =>
	Boolean(
		process.env.NEXT_PUBLIC_SUPABASE_URL &&
			process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
	);

export async function requireAdmin() {
	if (!configured()) redirect("/login?error=config");

	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) redirect("/login?callbackUrl=/admin");

	const { data: profile } = await supabase
		.from("profiles")
		.select("role, full_name")
		.eq("id", user.id)
		.maybeSingle();

	if (profile?.role !== "admin") redirect("/cuenta?error=forbidden");

	return { supabase, user, profile };
}
