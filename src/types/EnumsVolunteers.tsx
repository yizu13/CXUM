export interface VolunteerMember {
  id: number;
  name: string;
  role: string;
  initials: string;
  color: string;
  size: "large" | "medium" | "small";
  // Para usar imagen local: import foto from "../assets/volunteers/nombre.jpg" → imageUrl: foto
  // Para usar URL externa: imageUrl: "https://..."
  // Para mostrar solo iniciales: omite imageUrl o déjalo como undefined
  imageUrl?: string;
}

export const VOLUNTEER_MEMBERS: VolunteerMember[] = [
  {
    id: 1,
    name: "Valentina R.",
    role: "Coordinadora",
    initials: "VR",
    color: "#f59e0b",
    size: "large",
    imageUrl: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&q=80&fit=crop&crop=face",
  },
  {
    id: 2,
    name: "Carlos M.",
    role: "Voluntario",
    initials: "CM",
    color: "#fb923c",
    size: "small",
    imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80&fit=crop&crop=face",
  },
  {
    id: 3,
    name: "Sofía P.",
    role: "Diseñadora",
    initials: "SP",
    color: "#fbbf24",
    size: "medium",
    imageUrl: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&q=80&fit=crop&crop=face",
  },
  {
    id: 4,
    name: "Diego L.",
    role: "Voluntario",
    initials: "DL",
    color: "#f97316",
    size: "small",
    // Sin imageUrl → muestra iniciales
  },
  {
    id: 5,
    name: "Ana G.",
    role: "Líder",
    initials: "AG",
    color: "#f59e0b",
    size: "large",
    imageUrl: "https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?w=400&q=80&fit=crop&crop=face",
  },
  {
    id: 6,
    name: "Marco T.",
    role: "Voluntario",
    initials: "MT",
    color: "#fbbf24",
    size: "small",
    // Sin imageUrl → muestra iniciales
  },
  {
    id: 7,
    name: "Luisa V.",
    role: "Fotógrafa",
    initials: "LV",
    color: "#fb923c",
    size: "medium",
    imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80&fit=crop&crop=face",
  },
  {
    id: 8,
    name: "Pedro N.",
    role: "Voluntario",
    initials: "PN",
    color: "#f59e0b",
    size: "small",
    // Sin imageUrl → muestra iniciales
  },
  {
    id: 9,
    name: "Isabel C.",
    role: "Educadora",
    initials: "IC",
    color: "#f97316",
    size: "large",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80&fit=crop&crop=face",
  },
  {
    id: 10,
    name: "Ramón S.",
    role: "Voluntario",
    initials: "RS",
    color: "#fbbf24",
    size: "small",
    // Sin imageUrl → muestra iniciales
  },
  {
    id: 11,
    name: "Keyla F.",
    role: "Gestora",
    initials: "KF",
    color: "#f59e0b",
    size: "medium",
    imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80&fit=crop&crop=face",
  },
  {
    id: 12,
    name: "Jorge B.",
    role: "Voluntario",
    initials: "JB",
    color: "#fb923c",
    size: "small",
    // Sin imageUrl → muestra iniciales
  },
  {
    id: 13,
    name: "Nathaly D.",
    role: "Comunicadora",
    initials: "ND",
    color: "#fbbf24",
    size: "large",
    imageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80&fit=crop&crop=face",
  },
  {
    id: 14,
    name: "Luis A.",
    role: "Voluntario",
    initials: "LA",
    color: "#f97316",
    size: "small",
    // Sin imageUrl → muestra iniciales
  },
  {
    id: 15,
    name: "Carmen O.",
    role: "Enfermera",
    initials: "CO",
    color: "#f59e0b",
    size: "medium",
    imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80&fit=crop&crop=face",
  },
];
