import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { markdownToEmailHtml } from "@/modules/newsletter/campaign-email";
import { ConfirmSubmitButton } from "../../ConfirmSubmitButton";
import {
	AdminPageHeader,
	buttonGhost,
	buttonPrimary,
	buttonQuiet,
	card,
	Field,
	Flag,
	type FlagTone,
	FormBanner,
	formatDateTime,
	SaveButton,
	table,
	tableWrap,
	td,
	th,
} from "../../_ui";
import { deleteCampaignDraft, saveCampaignDraft, sendCampaign } from "../actions";
import { AudiencePicker } from "../AudiencePicker";
import { loadAudienceOptions } from "../_data";

const RECIPIENT_TONES: Record<string, { text: string; tone: FlagTone }> = {
	pending: { text: "Pendiente", tone: "espera" },
	sent: { text: "Enviado", tone: "hecho" },
	failed: { text: "Falló", tone: "fallo" },
};

export default async function CampaignDetailPage({
	params,
	searchParams,
}: {
	params: Promise<{ id: string }>;
	searchParams: Promise<{ error?: string; saved?: string; sent?: string }>;
}) {
	const { id } = await params;
	const query = await searchParams;
	if (!z.string().uuid().safeParse(id).success) notFound();

	const { supabase } = await requireAdmin();
	const { data: campaign, error } = await supabase
		.from("newsletter_campaigns")
		.select(
			"id, reference, subject, body, audience_kind, list_id, offering_id, offering_scope, status, sent_at, created_at",
		)
		.eq("id", id)
		.maybeSingle();
	if (error) {
		throw new Error(`No se pudo cargar la campaña: ${error.message}`);
	}
	if (!campaign) notFound();

	const isDraft = campaign.status === "borrador";
	const { lists, offerings } = await loadAudienceOptions(supabase);

	const recipients = isDraft
		? { data: [], error: null }
		: await supabase
				.from("newsletter_campaign_recipients")
				.select("id, email, status, attempts, last_error, sent_at")
				.eq("campaign_id", id)
				.order("email");
	if (recipients.error) {
		throw new Error(
			`No se pudieron cargar los destinatarios: ${recipients.error.message}`,
		);
	}
	const rows = recipients.data ?? [];
	const sent = rows.filter((row) => row.status === "sent").length;
	const failed = rows.filter((row) => row.status === "failed").length;

	return (
		<div className="max-w-3xl">
			<FormBanner
				error={query.error}
				success={query.saved ? "saved" : query.sent ? "sent" : undefined}
				errorMessages={{
					save: "No se pudo guardar la campaña.",
					delete: "No se pudo eliminar el borrador.",
					"not-draft": "Esta campaña ya no es un borrador.",
					prepare: "No se pudo preparar la lista de destinatarios.",
					empty:
						"La audiencia elegida no tiene ni un destinatario: no se envió nada.",
					provider: "Falta configuración del proveedor de correo.",
				}}
				successMessages={{
					saved: "Borrador guardado.",
					sent: "Envío terminado. Abajo está el resultado por destinatario.",
				}}
			/>
			<AdminPageHeader
				title={campaign.subject}
				description={`Referencia ${campaign.reference} · creada ${formatDateTime(campaign.created_at)}`}
				action={
					<Link href="/admin/campanas" className={buttonGhost}>
						Volver
					</Link>
				}
			/>

			{isDraft ? (
				<>
					<form action={saveCampaignDraft} className="space-y-5" id="campaign">
						<input type="hidden" name="id" value={campaign.id} />
						<Field
							label="Asunto"
							name="subject"
							required
							defaultValue={campaign.subject}
						/>
						<AudiencePicker
							lists={lists}
							offerings={offerings}
							defaultKind={campaign.audience_kind === "curso" ? "curso" : "lista"}
							defaultListId={campaign.list_id}
							defaultOfferingId={campaign.offering_id}
							defaultScope={campaign.offering_scope}
						/>
						<Field
							label="Cuerpo"
							name="body"
							textarea
							rows={16}
							required
							defaultValue={campaign.body}
							hint="Markdown: ## títulos, **negrita**, listas con - y enlaces [texto](https://…)."
						/>
						<SaveButton>Guardar borrador</SaveButton>
					</form>

					<section className={`${card} mt-8`}>
						<h2 className="mb-2 text-sm font-semibold">Vista previa</h2>
						{/* Contenido propio del panel, ya convertido a HTML seguro por
						    el mismo renderer que usa el correo. */}
						<div
							className="text-[13px] leading-6 text-muted-foreground"
							// biome-ignore lint/security/noDangerouslySetInnerHtml: HTML generado por markdownToEmailHtml, que escapa la entrada.
							dangerouslySetInnerHTML={{
								__html: markdownToEmailHtml(campaign.body),
							}}
						/>
					</section>

					<div className="mt-8 flex flex-wrap items-center gap-3 border-t border-border pt-6">
						<form action={sendCampaign}>
							<input type="hidden" name="id" value={campaign.id} />
							<ConfirmSubmitButton
								className={buttonPrimary}
								message="Se enviará ahora a toda la audiencia elegida. Esto no se puede deshacer."
							>
								Enviar ahora
							</ConfirmSubmitButton>
						</form>
						<form action={deleteCampaignDraft}>
							<input type="hidden" name="id" value={campaign.id} />
							<ConfirmSubmitButton
								className={buttonQuiet}
								message="Se eliminará este borrador."
							>
								Eliminar borrador
							</ConfirmSubmitButton>
						</form>
					</div>
				</>
			) : (
				<>
					<p className="mb-5 text-sm text-muted-foreground">
						{sent} {sent === 1 ? "entregado" : "entregados"} y {failed}{" "}
						{failed === 1 ? "fallido" : "fallidos"} de {rows.length}.
						{campaign.sent_at
							? ` Enviada ${formatDateTime(campaign.sent_at)}.`
							: ""}
					</p>
					<div className={tableWrap}>
						<table className={table}>
							<thead>
								<tr>
									<th className={th}>Destinatario</th>
									<th className={th}>Estado</th>
									<th className={th}>Intentos</th>
									<th className={th}>Detalle</th>
								</tr>
							</thead>
							<tbody>
								{rows.map((row) => {
									const flag = RECIPIENT_TONES[row.status] ?? {
										text: row.status,
										tone: "neutro" as FlagTone,
									};
									return (
										<tr key={row.id}>
											<td className={td}>{row.email}</td>
											<td className={td}>
												<Flag tone={flag.tone}>{flag.text}</Flag>
											</td>
											<td className={td}>{row.attempts}</td>
											<td className={td}>
												{row.last_error ?? formatDateTime(row.sent_at)}
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				</>
			)}
		</div>
	);
}
