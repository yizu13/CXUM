import type { DonationField, DonationForm } from "./types";
import { DEFAULT_DONATION_FORM_ICON } from "./icons";

export function createDonationField(index: number): DonationField {
  return {
    id: `campo_${Date.now()}_${index}`,
    label: "Nuevo campo",
    type: "text",
    required: false,
    priority: index + 1,
    section: "General",
    maxLength: 80,
  };
}

export function createDonationForm(): DonationForm {
  const id = `form-${Date.now()}`;
  return {
    id,
    title: "Nueva campana de donacion",
    slug: `nueva-campana-${Date.now()}`,
    description: "Describe que se va a recolectar y como se usaran los datos.",
    headerIcon: DEFAULT_DONATION_FORM_ICON,
    eventDate: undefined,
    status: "draft",
    mode: "guided",
    thankYouMessage: "Gracias por apoyar esta iniciativa.",
    allowRepeatSubmissions: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    fields: [
      {
        id: "identificacion",
        label: "Identificacion",
        type: "text",
        required: true,
        priority: 1,
        section: "Identificacion",
        maxLength: 24,
      },
      {
        id: "cantidad",
        label: "Cantidad",
        type: "number",
        required: true,
        priority: 2,
        section: "Donacion",
        min: 1,
      },
    ],
    primaryFieldId: "identificacion",
    respondentFieldId: "identificacion",
    locationFieldId: undefined,
  };
}
