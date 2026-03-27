export interface TeamMember {
  id: string;
  name: string;
  role: string;
  // Sustituye imageUrl por el import de tu imagen local o una URL real
  // Ejemplo local: import foto from "../../assets/team/juan.jpg"  → imageUrl: foto
  imageUrl: string;
}

// ─── Sustituye cada imageUrl por la foto real del miembro ────────────────────
export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: "member-1",
    name: "Nombre Apellido",
    role: "Fundadora & Directora",
    imageUrl: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&q=80&fit=crop&crop=face",
  },
  {
    id: "member-2",
    name: "Nombre Apellido",
    role: "Coordinadora de Voluntarios",
    imageUrl: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&q=80&fit=crop&crop=face",
  },
  {
    id: "member-3",
    name: "Nombre Apellido",
    role: "Responsable de Logística",
    imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&q=80&fit=crop&crop=face",
  },
  {
    id: "member-4",
    name: "Nombre Apellido",
    role: "Líder de Comunicaciones",
    imageUrl: "https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?w=600&q=80&fit=crop&crop=face",
  },
  {
    id: "member-5",
    name: "Nombre Apellido",
    role: "Coordinadora de Donaciones",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80&fit=crop&crop=face",
  },
  {
    id: "member-6",
    name: "Nombre Apellido",
    role: "Relaciones Comunitarias",
    imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80&fit=crop&crop=face",
  },
  {
    id: "member-7",
    name: "Nombre Apellido",
    role: "Diseño & Creatividad",
    imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&q=80&fit=crop&crop=face",
  },
];
