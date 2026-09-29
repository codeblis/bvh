import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/bvh/LegalPage";

export const metadata: Metadata = { title: "Privacidad | BVH" };

export default function PrivacidadPage() {
	return <LegalPage title="Política de privacidad" updated="agosto de 2026">
		<LegalSection title="Datos que recopilamos"><p>Podemos recibir nombre, correo, teléfono, datos profesionales o empresariales y el contenido que envíes mediante formularios. La autenticación es gestionada mediante Supabase y los correos transaccionales mediante Resend.</p></LegalSection>
		<LegalSection title="Finalidades"><p>Usamos esos datos para responder consultas, gestionar solicitudes de interés, autenticar cuentas, entregar comunicaciones solicitadas y proteger el portal.</p></LegalSection>
		<LegalSection title="Base y conservación"><p>Tratamos los datos con tu consentimiento o para atender una solicitud iniciada por ti. Los conservamos sólo durante el tiempo necesario para esa finalidad y para cumplir obligaciones aplicables.</p></LegalSection>
		<LegalSection title="Proveedores"><p>Los proveedores técnicos procesan información únicamente para prestar sus servicios. No vendemos información personal ni la utilizamos para publicidad de terceros.</p></LegalSection>
		<LegalSection title="Tus opciones"><p>Puedes solicitar acceso, corrección o eliminación de tus datos y retirar una suscripción desde el enlace incluido en cada comunicación.</p></LegalSection>
	</LegalPage>;
}
