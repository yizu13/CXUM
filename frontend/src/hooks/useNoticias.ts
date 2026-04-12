import { useEffect, useState } from "react";
import { getNoticias, getNoticia } from "../platform/APIs/noticias";
import type { NewsItem } from "../types/newsSection";

const CATEGORY_COLORS: Record<string, string> = {
  emergencia:   "#ef4444",
  voluntariado: "#3b82f6",
  donaciones:   "#22c55e",
  evento:       "#8b5cf6",
  general:      "#94a3b8",
};

function toNewsItem(n: {
  id: string; slug: string; titulo: string; resumen: string;
  portada: string; autor: string; categoria: string;
  fechaPublicacion: string; vistas?: number; contenido?: string;
}): NewsItem {
  return {
    id: n.id,
    slug: n.slug,
    category: n.categoria.charAt(0).toUpperCase() + n.categoria.slice(1),
    categoryColor: CATEGORY_COLORS[n.categoria] ?? "#94a3b8",
    date: new Date(n.fechaPublicacion).toLocaleDateString("es-DO", { day: "numeric", month: "long", year: "numeric" }),
    dateISO: n.fechaPublicacion,
    title: n.titulo,
    description: n.resumen,
    image: n.portada || "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=80",
    author: n.autor,
    readTime: Math.max(1, Math.ceil((n.contenido?.length ?? 500) / 1000)),
    views: n.vistas ?? 0,
  };
}

export function useNoticias() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getNoticias()
      .then((res) => {
        const mapped = res.noticias.map(toNewsItem);
        mapped.sort((a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime());
        setItems(mapped);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return { items, loading, error };
}

export function useNoticia(slug: string) {
  const [item, setItem] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setNotFound(false);
    getNoticia(slug)
      .then((n) => setItem(toNewsItem(n)))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  return { item, loading, notFound };
}
