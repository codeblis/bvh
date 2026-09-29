"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";

const roleSchema = z.object({
	id: z.string().uuid(),
	role: z.enum(["usuario", "admin"]),
});

// La RPC señala cada negativa con un motivo propio; se traduce a un aviso.
const reasons: Record<string, string> = {
	forbidden: "forbidden",
	invalid_role: "invalid",
	self_role_change: "self",
	profile_not_found: "not-found",
};

export async function updateProfileRole(formData: FormData) {
	const parsed = roleSchema.safeParse({
		id: String(formData.get("id") ?? ""),
		role: String(formData.get("role") ?? ""),
	});
	if (!parsed.success) redirect("/admin/usuarios?error=invalid");

	const { supabase } = await requireAdmin();
	const { error } = await supabase.rpc("set_profile_role", {
		p_user_id: parsed.data.id,
		p_role: parsed.data.role,
	});
	if (error) {
		const matched = Object.keys(reasons).find((key) =>
			error.message.includes(key),
		);
		redirect(`/admin/usuarios?error=${matched ? reasons[matched] : "save"}`);
	}

	revalidatePath("/admin/usuarios");
	revalidatePath("/admin");
	redirect(`/admin/usuarios?saved=${parsed.data.role}`);
}
