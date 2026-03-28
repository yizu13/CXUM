import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { useSettings } from "../../hooks/context/SettingsContext";
import {
  COLLECTION_CENTERS,
  type CollectionCenter,
  type CollectionCenterStatus,
} from "../../types/EnumsCollectionCenters";

// ─── CONFIGURACIÓN AWS ──────────────────────────────────────────────────────
const REGION  = import.meta.env.VITE_AWS_REGION   || "us-east-1";
const MAP     = import.meta.env.VITE_AWS_MAP_NAME  || "";
const API_KEY = import.meta.env.VITE_AWS_API_KEY   || "";

// ✅ URL correcta para AWS Location Service con API Key
const TILE_URL =
  `https://maps.geo.${REGION}.amazonaws.com/v2/maps/${MAP}/tiles/{z}/{x}/{y}?key=${API_KEY}`;

// ─── COLORES POR ESTADO ─────────────────────────────────────────────────────
const STATUS_COLOR: Record<CollectionCenterStatus, string> = {
  open:         "#22c55e",
  closing_soon: "#f59e0b",
  closed:       "#ef4444",
};

const STATUS_LABEL: Record<CollectionCenterStatus, string> = {
  open:         "Abierto",
  closing_soon: "Cierra pronto",
  closed:       "Cerrado",
};

// ─── CONTROLADOR DE MOVIMIENTO ──────────────────────────────────────────────
function MapController({ center }: { center: CollectionCenter | null }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo([center.lat, center.lng], 15, { duration: 1.5 });
  }, [center, map]);
  return null;
}

// ─── ICONO PERSONALIZADO ────────────────────────────────────────────────────
const makeIcon = (color: string) =>
  L.divIcon({
    className: "custom-marker",
    html: `
      <svg width="34" height="46" viewBox="0 0 34 46"
           style="filter:drop-shadow(0 2px 4px rgba(0,0,0,0.25))">
        <path d="M17 2C9.82 2 4 7.82 4 15c0 9.75 13 27 13 27S30 24.75 30 15C30 7.82 24.18 2 17 2z"
              fill="${color}" stroke="white" stroke-width="2"/>
        <circle cx="17" cy="15" r="5" fill="white"/>
      </svg>`,
    iconSize:    [34, 46],
    iconAnchor:  [17, 46],
    popupAnchor: [0, -40],
  });

// ─── COMPONENTE PRINCIPAL ───────────────────────────────────────────────────
export default function CollectionMap() {
  const { theme } = useSettings();
  const isDark = theme === "dark";
  const [selected, setSelected] = useState<CollectionCenter | null>(null);

  return (
    <div className="flex flex-col lg:flex-row h-[600px] w-full rounded-3xl overflow-hidden border border-slate-200/10 shadow-xl">

      {/* ── Lista lateral ── */}
      <div className={`w-full lg:w-80 overflow-y-auto p-6 ${isDark ? "bg-[#0d1117] text-white" : "bg-white text-slate-900"}`}>
        <h3 className="text-xl font-bold mb-6">Puntos de Entrega</h3>
        <div className="space-y-3">
          {COLLECTION_CENTERS.map((center) => (
            <button
              key={center.id}
              onClick={() => setSelected(center)}
              className={`w-full text-left p-4 rounded-2xl transition-all border ${
                selected?.id === center.id
                  ? "bg-amber-500/10 border-amber-500 text-amber-500"
                  : "bg-transparent border-transparent hover:bg-slate-500/5"
              }`}
            >
              <p className="font-bold text-sm leading-tight">{center.title}</p>
              <p className="text-xs opacity-60 mt-1">{center.address}</p>
              <span
                className="inline-block mt-2 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: STATUS_COLOR[center.status] + "20",
                  color: STATUS_COLOR[center.status],
                }}
              >
                {STATUS_LABEL[center.status]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Mapa ── */}
      <div className="flex-1 relative">
        <MapContainer
          center={[18.48, -69.93]}
          zoom={11}
          zoomControl={false}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url={TILE_URL}
            attribution='&copy; <a href="https://aws.amazon.com/location/">Amazon Location Service</a>'
            maxZoom={20}
          />

          <MapController center={selected} />

          {COLLECTION_CENTERS.map((center) => (
            <Marker
              key={center.id}
              position={[center.lat, center.lng]}
              icon={makeIcon(STATUS_COLOR[center.status])}
              eventHandlers={{ click: () => setSelected(center) }}
            >
              <Popup>
                <div className="p-1">
                  <p className="font-bold text-slate-900 m-0 mb-1">{center.title}</p>
                  <p className="text-[11px] text-slate-500 m-0">{center.address}</p>
                  <span
                    className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: STATUS_COLOR[center.status] + "20",
                      color: STATUS_COLOR[center.status],
                    }}
                  >
                    {STATUS_LABEL[center.status]}
                  </span>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <style>{`
        .custom-marker { background: none !important; border: none !important; }
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          padding: 4px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }
        .leaflet-popup-tip { display: none; }
      `}</style>
    </div>
  );
}