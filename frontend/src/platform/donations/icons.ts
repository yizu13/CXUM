export const DEFAULT_DONATION_FORM_ICON = "solar:clipboard-heart-bold-duotone";

export type DonationIconOption = {
  value: string;
  label: string;
  category: string;
  keywords: string[];
};

export const DONATION_ICON_CATALOG: DonationIconOption[] = [
  { value: DEFAULT_DONATION_FORM_ICON, label: "Formulario solidario", category: "Donaciones", keywords: ["aporte", "registro", "corazon"] },
  { value: "solar:heart-bold-duotone", label: "Corazon", category: "Donaciones", keywords: ["amor", "apoyo", "solidaridad"] },
  { value: "mdi:hand-heart", label: "Mano solidaria", category: "Donaciones", keywords: ["ayuda", "voluntariado", "aporte"] },
  { value: "mdi:gift", label: "Regalo", category: "Donaciones", keywords: ["obsequio", "entrega", "donacion"] },
  { value: "solar:bag-bold-duotone", label: "Bolsa de aportes", category: "Donaciones", keywords: ["articulos", "recoleccion"] },
  { value: "solar:star-bold-duotone", label: "Iniciativa destacada", category: "Donaciones", keywords: ["meta", "especial"] },
  { value: "mdi:book-open-page-variant", label: "Libros", category: "Educacion", keywords: ["lectura", "biblioteca", "textos"] },
  { value: "mdi:notebook-outline", label: "Cuadernos", category: "Educacion", keywords: ["utiles", "papeleria", "escuela"] },
  { value: "mdi:pencil", label: "Lapices", category: "Educacion", keywords: ["utiles", "escritura", "escuela"] },
  { value: "mdi:school", label: "Escuela", category: "Educacion", keywords: ["estudiantes", "educacion", "aula"] },
  { value: "solar:diploma-bold-duotone", label: "Formacion", category: "Educacion", keywords: ["certificado", "aprendizaje"] },
  { value: "mdi:backpack", label: "Mochilas", category: "Educacion", keywords: ["utiles", "estudiantes", "escuela"] },
  { value: "mdi:food-apple", label: "Alimentos", category: "Necesidades", keywords: ["comida", "nutricion", "frutas"] },
  { value: "mdi:bottle-soda-classic-outline", label: "Bebidas", category: "Necesidades", keywords: ["agua", "hidratacion"] },
  { value: "mdi:tshirt-crew", label: "Ropa", category: "Necesidades", keywords: ["vestimenta", "textil"] },
  { value: "mdi:medical-bag", label: "Salud", category: "Necesidades", keywords: ["medicinas", "botiquin", "insumos"] },
  { value: "solar:home-smile-bold-duotone", label: "Hogar", category: "Necesidades", keywords: ["familia", "vivienda"] },
  { value: "mdi:package-variant-closed", label: "Paquetes", category: "Necesidades", keywords: ["caja", "entrega", "articulos"] },
  { value: "solar:users-group-two-rounded-bold-duotone", label: "Comunidad", category: "Comunidad", keywords: ["personas", "grupo", "familias"] },
  { value: "solar:user-hand-up-bold-duotone", label: "Voluntariado", category: "Comunidad", keywords: ["voluntario", "participacion"] },
  { value: "solar:map-point-bold-duotone", label: "Punto de recoleccion", category: "Comunidad", keywords: ["lugar", "ubicacion", "entrega"] },
  { value: "solar:calendar-bold-duotone", label: "Evento", category: "Comunidad", keywords: ["fecha", "actividad", "jornada"] },
  { value: "solar:flag-bold-duotone", label: "Campana", category: "Comunidad", keywords: ["objetivo", "iniciativa", "meta"] },
  { value: "solar:leaf-bold-duotone", label: "Medio ambiente", category: "Comunidad", keywords: ["naturaleza", "ecologia", "reciclaje"] },
];

export function isValidIconifyName(value: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*:[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.trim().toLowerCase());
}

export function resolveDonationFormIcon(value?: string) {
  return value && isValidIconifyName(value) ? value : DEFAULT_DONATION_FORM_ICON;
}
