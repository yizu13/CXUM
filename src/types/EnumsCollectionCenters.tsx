export type CollectionCenterStatus = "open" | "closing_soon" | "closed";

export interface CollectionCenter {
  id: string;
  title: string;
  subtitle: string;
  address: string;
  schedule: string;
  status: CollectionCenterStatus;
  lat: number;
  lng: number;
  acceptedItems: string[];
}

export const COLLECTION_CENTERS: CollectionCenter[] = [
  {
    id: "centro-norte",
    title: "Centro Norte de Acopio",
    subtitle: "Villa Consuelo, Santo Domingo",
    address: "Av. Máximo Gómez #45, Villa Consuelo",
    schedule: "Lun–Vie 8AM–5PM",
    status: "open",
    lat: 18.4861,
    lng: -69.9312,
    acceptedItems: ["Cuadernos", "Libros", "Papel"],
  },
  {
    id: "centro-este",
    title: "Punto de Reciclaje Este",
    subtitle: "Los Mina, Santo Domingo Este",
    address: "C/ Las Caobas #12, Los Mina",
    schedule: "Lun–Sáb 7AM–6PM",
    status: "open",
    lat: 18.505,
    lng: -69.861,
    acceptedItems: ["Cuadernos", "Cartón", "Revistas"],
  },
  {
    id: "centro-oeste",
    title: "Hub Comunitario Oeste",
    subtitle: "Herrera, Santo Domingo Oeste",
    address: "Av. Independencia Km 9, Herrera",
    schedule: "Mar–Sáb 9AM–4PM",
    status: "closing_soon",
    lat: 18.4721,
    lng: -70.003,
    acceptedItems: ["Cuadernos", "Papel", "Libros de texto"],
  },
  {
    id: "centro-sur",
    title: "Acopio Sur",
    subtitle: "Boca Chica, Santo Domingo",
    address: "C/ Duarte #88, Boca Chica",
    schedule: "Miér–Dom 8AM–3PM",
    status: "closed",
    lat: 18.4529,
    lng: -69.6082,
    acceptedItems: ["Cuadernos", "Material escolar"],
  },
  {
    id: "centro-gazcue",
    title: "Centro Cultural Gazcue",
    subtitle: "Gazcue, Distrito Nacional",
    address: "C/ Hostos #200, Gazcue",
    schedule: "Lun–Vie 8AM–6PM",
    status: "open",
    lat: 18.4748,
    lng: -69.9082,
    acceptedItems: ["Cuadernos", "Enciclopedias", "Arte"],
  },
  {
    id: "centro-santiago",
    title: "Nodo Santiago",
    subtitle: "Centro, Santiago de los Caballeros",
    address: "Av. Juan Pablo Duarte #55, Santiago",
    schedule: "Lun–Sáb 8AM–5PM",
    status: "open",
    lat: 19.4517,
    lng: -70.6916,
    acceptedItems: ["Cuadernos", "Libros", "Papel reciclado"],
  },
];
