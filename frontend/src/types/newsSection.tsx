// esto debe ser migrado a una base de datos o un manejo similar

export interface NewsItem {
  id: string;
  slug: string;
  category: string;
  categoryColor: string;
  date: string;
  dateISO: string; // para ordenar
  title: string;
  description: string;
  image: string;
  author: string;
  readTime: number; // minutos
  views: number;
}

export const NEWS: NewsItem[] = [
  {
    id: "1",
    slug: "100-ninos-reciben-kits-escolares",
    category: "Educación",
    categoryColor: "#f59e0b",
    date: "15 de enero, 2026",
    dateISO: "2026-01-15",
    title: "100 niños reciben kits escolares completos",
    description:
      "En la comunidad de Los Mina, celebramos la entrega de útiles escolares que beneficiaron a 100 estudiantes, gracias al apoyo de nuestros voluntarios y donantes.",
    image:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80&fit=crop",
    author: "Equipo CXUM",
    readTime: 3,
    views: 1840,
  },
  {
    id: "2",
    slug: "familias-reciben-apoyo-alimentario",
    category: "Impacto Social",
    categoryColor: "#3b82f6",
    date: "28 de enero, 2026",
    dateISO: "2026-01-28",
    title: "Familias reciben apoyo alimentario de emergencia",
    description:
      "Nuestra fundación entregó paquetes alimentarios a 50 familias afectadas por la crisis económica, demostrando que juntos somos más fuertes.",
    image:
      "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=80&fit=crop",
    author: "Darlyn Contreras",
    readTime: 4,
    views: 2310,
  },
  {
    id: "3",
    slug: "jornada-limpieza-costera-2-toneladas",
    category: "Medio Ambiente",
    categoryColor: "#22c55e",
    date: "3 de febrero, 2026",
    dateISO: "2026-02-03",
    title: "Jornada de limpieza costera recolecta 2 toneladas",
    description:
      "Más de 200 voluntarios se unieron para limpiar nuestras playas, recolectando residuos plásticos y concientizando sobre el cuidado del medio ambiente.",
    image:
      "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&q=80&fit=crop",
    author: "Angélica Roa",
    readTime: 5,
    views: 3105,
  },
  {
    id: "4",
    slug: "taller-tecnologia-jovenes-villa-mella",
    category: "Tecnología",
    categoryColor: "#8b5cf6",
    date: "17 de febrero, 2026",
    dateISO: "2026-02-17",
    title: "Taller de tecnología empodera a jóvenes de Villa Mella",
    description:
      "Un ciclo de capacitación en programación básica y ofimática llegó a 60 jóvenes del sector de Villa Mella, abriendo puertas al mercado laboral digital.",
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80&fit=crop",
    author: "Equipo CXUM",
    readTime: 4,
    views: 980,
  },
  {
    id: "5",
    slug: "brigada-salud-comunidad-sabana-perdida",
    category: "Salud",
    categoryColor: "#ec4899",
    date: "5 de marzo, 2026",
    dateISO: "2026-03-05",
    title: "Brigada médica gratuita atiende a 300 personas en Sabana Perdida",
    description:
      "Médicos y enfermeras voluntarios ofrecieron consultas, vacunas y medicamentos sin costo a residentes de Sabana Perdida durante una jornada de atención primaria.",
    image:
      "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=800&q=80&fit=crop",
    author: "Karla Faxas",
    readTime: 6,
    views: 4220,
  },
  {
    id: "6",
    slug: "donacion-libros-biblioteca-comunitaria",
    category: "Educación",
    categoryColor: "#f59e0b",
    date: "19 de marzo, 2026",
    dateISO: "2026-03-19",
    title: "Más de 500 libros llegan a la biblioteca comunitaria de Capotillo",
    description:
      "Gracias a la campaña de donación de libros impulsada por CXUM, la biblioteca del barrio Capotillo amplió su colección con títulos de literatura, ciencia y arte.",
    image:
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80&fit=crop",
    author: "Pedro Olavarrieta",
    readTime: 3,
    views: 1560,
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Ordenadas de más reciente a más antiguo */
export const NEWS_BY_DATE = [...NEWS].sort(
  (a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime()
);

/** Las 3 con más visualizaciones */
export const NEWS_TOP_VIEWS = [...NEWS]
  .sort((a, b) => b.views - a.views)
  .slice(0, 3);

/** Las 3 más recientes */
export const NEWS_RECENT = NEWS_BY_DATE.slice(0, 3);
