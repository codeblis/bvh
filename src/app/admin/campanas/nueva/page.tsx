import { requireAdmin } from "@/lib/admin";
import { AdminPageHeader, Field, SaveButton } from "../../_ui";
import { saveCampaignDraft } from "../actions";
import { AudiencePicker } from "../AudiencePicker";
import { loadAudienceOptions } from "../_data";

export default async function NewCampaignPage() {
	const { supabase } = await requireAdmin();
	const { lists, offerings } = await loadAudienceOptions(supabase);

	return (
		<div className="max-w-3xl">
			<AdminPageHeader
				title="Nueva campaña"
				description="Se guarda como borrador. Nada sale hasta que lo envíes."
			/>
			<form action={saveCampaignDraft} className="space-y-5">
				<Field
					label="Asunto"
					name="subject"
					required
					placeholder="Boletín de octubre"
				/>
				<AudiencePicker lists={lists} offerings={offerings} />
				<Field
					label="Cuerpo"
					name="body"
					textarea
					rows={16}
					required
					hint="Markdown: ## títulos, **negrita**, listas con - y enlaces [texto](https://…)."
				/>
				<SaveButton>Guardar borrador</SaveButton>
			</form>
		</div>
	);
}
