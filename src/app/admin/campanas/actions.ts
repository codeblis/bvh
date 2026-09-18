"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { createReference } from "@/lib/forms";
import { emailConfig } from "@/lib/resend";
import { createServiceClient } from "@/lib/supabase/service";
import { deliverEmail } from "@/modules/forms/email.server";
import { getAuthSiteOrigin } from "@/modules/identity/site-url";
import { campaignEmailHtml } from "@/modules/newsletter/campaign-email";

const draftSchema = z
	.object({
		id: z.string().uuid().optional(),
		subject: z.string().trim().min(2).max(160),
		body: z.string().trim().min(10).max(50_000),
		audienceKind: z.enum(["lista", "curso"]),
		listId: z.string().uuid().optional(),
		offeringId: z.string().uuid().optional(),
		offeringScope: z.enum(["inscritos", "lista_espera", "todos"]).optional(),
	})
	.superRefine((data, context) => {
		// La separación de audiencias también se valida aquí para dar un error
		// legible; la base la impone de todas formas.
		if (data.audienceKind === "lista" && !data.listId) {
			context.addIssue({
				code: "custom",
				path: ["listId"],
				message: "Falta la lista",
			});
		}
		if (
			data.audienceKind === "curso" &&
			(!data.offeringId || !data.offeringScope)
		) {
			context.addIssue({
				code: "custom",
				path: ["offeringId"],
				message: "Falta la edición o el destinatario",
			});
		}
	});

function optional(formData: FormData, key: string) {
	const value = String(formData.get(key) ?? "").trim();
	return value || undefined;
}

export async function saveCampaignDraft(formData: FormData) {
	const parsed = draftSchema.safeParse({
		id: optional(formData, "id"),
		subject: String(formData.get("subject") ?? ""),
		body: String(formData.get("body") ?? ""),
		audienceKind: String(formData.get("audience_kind") ?? ""),
		listId: optional(formData, "list_id"),
		offeringId: optional(formData, "offering_id"),
		offeringScope: optional(formData, "offering_scope"),
	});
	if (!parsed.success) redirect("/admin/campanas?error=invalid");

	const { supabase, user } = await requireAdmin();
	const data = parsed.data;
	const isList = data.audienceKind === "lista";
	const payload = {
		subject: data.subject,
		body: data.body,
		audience_kind: data.audienceKind,
		list_id: isList ? (data.listId ?? null) : null,
		offering_id: isList ? null : (data.offeringId ?? null),
		offering_scope: isList ? null : (data.offeringScope ?? null),
	};

	if (data.id) {
		const updated = await supabase
			.from("newsletter_campaigns")
			.update(payload)
			.eq("id", data.id)
			.eq("status", "borrador");
		if (updated.error) redirect(`/admin/campanas/${data.id}?error=save`);
		revalidatePath("/admin/campanas");
		redirect(`/admin/campanas/${data.id}?saved=true`);
	}

	const created = await supabase
		.from("newsletter_campaigns")
		.insert({
			...payload,
			reference: createReference("BVH-CAMP"),
			created_by: user.id,
		})
		.select("id")
		.single();
	if (created.error || !created.data) redirect("/admin/campanas?error=save");
	revalidatePath("/admin/campanas");
	redirect(`/admin/campanas/${created.data.id}?saved=true`);
}

export async function deleteCampaignDraft(formData: FormData) {
	const id = z.string().uuid().safeParse(String(formData.get("id") ?? ""));
	if (!id.success) redirect("/admin/campanas?error=invalid");
	const { supabase } = await requireAdmin();
	// Solo un borrador se borra: lo enviado es histórico y no se reescribe.
	const removed = await supabase
		.from("newsletter_campaigns")
		.delete()
		.eq("id", id.data)
		.eq("status", "borrador");
	if (removed.error) redirect(`/admin/campanas/${id.data}?error=delete`);
	revalidatePath("/admin/campanas");
	redirect("/admin/campanas?deleted=true");
}

export async function sendCampaign(formData: FormData) {
	const id = z.string().uuid().safeParse(String(formData.get("id") ?? ""));
	if (!id.success) redirect("/admin/campanas?error=invalid");
	const campaignId = id.data;
	const { supabase } = await requireAdmin();

	const campaign = await supabase
		.from("newsletter_campaigns")
		.select("id, reference, subject, body, audience_kind, status")
		.eq("id", campaignId)
		.maybeSingle();
	if (campaign.error || !campaign.data) {
		redirect("/admin/campanas?error=not-found");
	}
	if (campaign.data.status !== "borrador") {
		redirect(`/admin/campanas/${campaignId}?error=not-draft`);
	}

	// Congela la audiencia y cierra la campaña a edición antes de enviar nada.
	const prepared = await supabase.rpc("prepare_campaign_recipients", {
		p_campaign_id: campaignId,
	});
	if (prepared.error) {
		redirect(`/admin/campanas/${campaignId}?error=prepare`);
	}
	if ((prepared.data ?? 0) === 0) {
		await supabase.rpc("finish_campaign", { p_campaign_id: campaignId });
		redirect(`/admin/campanas/${campaignId}?error=empty`);
	}

	let service: ReturnType<typeof createServiceClient>;
	try {
		service = createServiceClient();
	} catch {
		redirect(`/admin/campanas/${campaignId}?error=provider`);
	}

	const pending = await service
		.from("newsletter_campaign_recipients")
		.select("id, email, full_name, unsubscribe_token")
		.eq("campaign_id", campaignId)
		.eq("status", "pending");
	if (pending.error) redirect(`/admin/campanas/${campaignId}?error=prepare`);

	let origin: string | null = null;
	try {
		origin = getAuthSiteOrigin();
	} catch {
		origin = null;
	}

	for (const recipient of pending.data ?? []) {
		const unsubscribeUrl =
			recipient.unsubscribe_token && origin
				? `${origin}/newsletter/baja?token=${recipient.unsubscribe_token}`
				: null;
		const delivery = await deliverEmail(
			{
				from: emailConfig.from,
				to: recipient.email,
				replyTo: emailConfig.to,
				subject: campaign.data.subject,
				html: campaignEmailHtml({
					subject: campaign.data.subject,
					body: campaign.data.body,
					recipientName: recipient.full_name,
					unsubscribeUrl,
					operationalNote: unsubscribeUrl
						? null
						: "Recibes este aviso porque tienes una inscripción o una plaza en espera en este curso del Instituto BVH.",
				}),
			},
			// Una clave por destinatario y campaña: reenviar no duplica correo.
			`${campaign.data.reference}-${recipient.id}`,
		);
		await service.rpc("record_campaign_delivery", {
			p_recipient_id: recipient.id,
			p_success: delivery.success,
			...(delivery.success
				? delivery.providerId
					? { p_provider_id: delivery.providerId }
					: {}
				: { p_error: delivery.error }),
		});
	}

	const finished = await supabase.rpc("finish_campaign", {
		p_campaign_id: campaignId,
	});
	revalidatePath("/admin/campanas");
	revalidatePath(`/admin/campanas/${campaignId}`);
	redirect(`/admin/campanas/${campaignId}?sent=${finished.data ?? "enviada"}`);
}
