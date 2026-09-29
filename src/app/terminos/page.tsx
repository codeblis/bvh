import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/bvh/LegalPage";

export const metadata: Metadata = { title: "Términos de uso | BVH" };

export default function TerminosPage() {
	return <LegalPage title="Términos de uso" updated="agosto de 2026">
		<LegalSection title="Naturaleza del portal"><p>BVH es actualmente un proyecto en desarrollo. El portal presenta su propuesta institucional y permite registrar interés en futuros servicios.</p></LegalSection>
		<LegalSection title="Datos demostrativos"><p>Los índices, precios, variaciones, volúmenes, empresas, usuarios y perfiles mostrados pueden ser simulados. No constituyen información bursátil en tiempo real, asesoramiento financiero, una recomendación ni una oferta de valores.</p></LegalSection>
		<LegalSection title="Uso permitido"><p>No debes utilizar el portal para actividades ilícitas, intentar acceder a áreas restringidas ni interferir con su funcionamiento. El contenido editorial puede citarse con atribución y enlace a la fuente.</p></LegalSection>
		<LegalSection title="Cuentas y comunicaciones"><p>Eres responsable de proporcionar datos correctos y proteger tus credenciales. El envío de un formulario no implica aceptación, listado, relación contractual ni compromiso de inversión.</p></LegalSection>
		<LegalSection title="Disponibilidad"><p>Durante esta etapa las funciones pueden cambiar, suspenderse o no estar disponibles. BVH procurará comunicar con claridad qué servicios están operativos.</p></LegalSection>
	</LegalPage>;
}
