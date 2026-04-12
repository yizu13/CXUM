import { useEffect, useState } from "react";
import { publicFetch } from "../platform/APIs/api";
import type { CollectionCenter, CollectionCenterStatus } from "../types/EnumsCollectionCenters";
import { StatusCheckFunction } from "../types/functionsMap";

interface CentroFromApi {
  id: string; nombre: string; direccion: string; municipio: string;
  telefono: string; horario: string; responsable: string;
  estado: string; capacidad: number; ocupacion: number; tipo: string;
  latitud?: number; longitud?: number;
}

function toCentro(c: CentroFromApi): CollectionCenter {
  const status: CollectionCenterStatus =
    c.estado === "activo" ? StatusCheckFunction(c.horario) :
    c.estado === "lleno"  ? "closing_soon" : "closed";

  return {
    id: c.id,
    title: c.nombre,
    subtitle: c.municipio,
    address: c.direccion,
    schedule: c.horario,
    status,
    lat: c.latitud ?? 18.4861,
    lng: c.longitud ?? -69.9312,
    acceptedItems: [c.tipo.charAt(0).toUpperCase() + c.tipo.slice(1)],
  };
}

export function useCentros() {
  const [centros, setCentros] = useState<CollectionCenter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ruta pública de centros
    publicFetch<{ count: number; centros: CentroFromApi[] }>("/centros")
      .then((res) => setCentros(res.centros.map(toCentro)))
      .catch(() => {/* mantiene array vacío */})
      .finally(() => setLoading(false));
  }, []);

  return { centros, loading };
}
