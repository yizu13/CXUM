import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { motion } from "motion/react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { useSettings } from "../../hooks/context/SettingsContext";
import type { CollectionCenter } from "../../types/EnumsCollectionCenters";
import { useCentros } from "../../hooks/useCentros";
import Iconify from "../modularUI/IconsMock";
import { headVariants, mapVariants, STATUS_COLOR, STATUS_LABEL } from "../../types/EnumsCollectionCenters";

function MapController({ center }: { center: CollectionCenter | null }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo([center.lat, center.lng], 14.5, { duration: 1.1 });
  }, [center, map]);
  return null;
}

const makeIcon = (color: string, active = false) =>
  L.divIcon({
    className: "cxum-marker",
    html: `<div style="
      width:${active ? 20 : 14}px;
      height:${active ? 20 : 14}px;
      border-radius:50%;
      background:${color};
      border:2.5px solid #fff;
      box-shadow:${
        active
          ? `0 0 0 5px ${color}30, 0 8px 20px rgba(0,0,0,.30)`
          : "0 4px 12px rgba(0,0,0,.22)"
      };
      transition:all .2s ease;
    "></div>`,
    iconSize:    [active ? 20 : 14, active ? 20 : 14],
    iconAnchor:  [active ? 10 : 7,  active ? 10 : 7],
    popupAnchor: [0, -12],
  });

export default function CollectionMap() {
  const { theme } = useSettings();
  const isDark = theme === "dark";
  const { centros: COLLECTION_CENTERS, loading } = useCentros();
  const [selected, setSelected] = useState<CollectionCenter | null>(null);
  const [search, setSearch] = useState("");

  const filteredCenters = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return COLLECTION_CENTERS;
    return COLLECTION_CENTERS.filter((c) =>
      c.title.toLowerCase().includes(term) ||
      c.address.toLowerCase().includes(term) ||
      c.subtitle.toLowerCase().includes(term) ||
      STATUS_LABEL[c.status].toLowerCase().includes(term)
    );
  }, [search, COLLECTION_CENTERS]);

  useEffect(() => {
    if (selected && !filteredCenters.find((c) => c.id === selected.id))
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelected(null);
  }, [filteredCenters, selected]);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const bg     = isDark ? "bg-[#05070b]" : "bg-[#f4f4ef]";
  const border = isDark ? "#30363d"       : "#e2e8f0";
  const text   = isDark ? "#e6edf3"       : "#0f172a";
  const muted  = isDark ? "#8b949e"       : "#64748b";
  const cardBg = isDark ? "#0d1117"       : "#ffffff";
  const cardSel= isDark ? "#161b22"       : "#fffbeb";
  const itemBg = isDark ? "#21262d"       : "#f1f5f9";

  return (
    <section
      id="PuntosDeEntrega"
      ref={sectionRef}
      className={`w-full py-32 px-6 md:px-16 lg:px-24 transition-colors duration-500 ${bg}`}
    >
      <div className="max-w-6xl mx-auto flex flex-col gap-14">

        <div className="flex flex-col items-center text-center gap-4">
          <motion.h2
            className={`font-black uppercase leading-none tracking-[-0.03em] ${
              isDark ? "text-white" : "text-slate-950"
            }`}
            style={{ fontSize: "clamp(2.4rem, 5.5vw, 5rem)" }}
            custom={0}
            variants={headVariants}
            initial="hidden"
            animate={inView ? "visible" : "exit"}
          >
            Centros de{" "}
            <span style={{ color: "#f59e0b" }}>acopio</span>
          </motion.h2>

          <motion.p
            className={`max-w-lg text-base leading-relaxed ${
              isDark ? "text-white/45" : "text-slate-500"
            }`}
            custom={1}
            variants={headVariants}
            initial="hidden"
            animate={inView ? "visible" : "exit"}
          >
            Encuentra el centro de acopio más cercano. Llevá tus cuadernos usados
            y dales una{" "}
            <span className={isDark ? "text-white/70" : "text-slate-700"}>
              segunda vida.
            </span>
          </motion.p>

          <motion.div
            className="h-0.5 rounded-full"
            style={{ backgroundColor: "#f59e0b" }}
            custom={2}
            initial={{ width: 0, opacity: 0 }}
            animate={
              inView ? { width: 48, opacity: 1 } : { width: 0, opacity: 0 }
            }
            transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>

        <motion.div
          variants={mapVariants}
          initial="hidden"
          animate={inView ? "visible" : "exit"}
          className="w-full overflow-hidden rounded-3xl shadow-2xl"
          style={{ border: `1px solid ${border}` }}
        >
          <div className="flex h-full flex-col lg:flex-row" style={{ height: "clamp(520px, 90vw, 700px)" }}>

            <aside
              className="flex w-full shrink-0 flex-col lg:w-85 max-h-[42%] lg:max-h-none border-b lg:border-b-0 lg:border-r"
              style={{
                background: cardBg,
                borderColor: border,
              }}
            >
              <div
                className="px-5 pt-5 pb-4"
                style={{ borderBottom: `1px solid ${border}` }}
              >
                <p
                  className="text-[20px] font-semibold "
                  style={{ color: "#f59e0b" }}
                >
                  Listado de Centros
                </p>
                <p className="mt-1 text-xs" style={{ color: muted }}>
                  {COLLECTION_CENTERS.filter((c) => c.status === "open").length} centros
                  abiertos · {COLLECTION_CENTERS.length} en total
                </p>              </div>

              <div className="px-3 pt-3">
                <div className="relative">
                  <svg
                    viewBox="0 0 24 24" fill="none"
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                    style={{ color: muted }}
                  >
                    <path d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
                      stroke="currentColor" strokeWidth="1.8"
                      strokeLinecap="round" strokeLinejoin="round"
                    />
                  </svg>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar centro..."
                    className="h-9 w-full rounded-xl pl-9 pr-8 text-xs outline-none transition-all duration-200"
                    style={{
                      background: isDark ? "rgba(255,255,255,0.05)" : "#f1f5f9",
                      border: `1px solid ${border}`,
                      color: text,
                    }}
                  />
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs"
                      style={{ color: muted }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              <div
                className="flex-1 overflow-y-auto p-3 space-y-2"
                style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
              >
                {loading ? (
                  <div className="pt-8 text-center">
                    <p className="text-sm font-semibold" style={{ color: text }}>Cargando centros...</p>
                  </div>
                ) : filteredCenters.length === 0 ? (
                  <div className="pt-8 text-center">
                    <p className="text-sm font-semibold" style={{ color: text }}>Sin resultados</p>
                    <p className="mt-1 text-xs" style={{ color: muted }}>Intenta con otro término.</p>
                  </div>
                ) : (
                  filteredCenters.map((center) => {
                  const isActive = selected?.id === center.id;
                  const color    = STATUS_COLOR[center.status];

                  return (
                    <button
                      key={center.id}
                      onClick={() => setSelected(isActive ? null : center)}
                      className="w-full rounded-2xl text-left transition-all duration-200"
                      style={{
                        padding:   "12px 14px",
                        background: isActive ? cardSel : "transparent",
                        border:     `1.5px solid ${isActive ? "#f59e0b55" : border}`,
                        transform:  isActive ? "scale(1.01)" : "scale(1)",
                        boxShadow:  isActive ? `0 6px 20px ${color}18` : "none",
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className="text-sm font-semibold leading-tight truncate"
                          style={{ color: isActive ? "#f59e0b" : text }}
                        >
                          {center.title}
                        </p>
                        <span
                          className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold"
                          style={{ background: `${color}18`, color }}
                        >
                          {STATUS_LABEL[center.status]}
                        </span>
                      </div>

                      <p
                        className="mt-0.5 text-xs font-medium"
                        style={{ color: muted }}
                      >
                        {center.subtitle}
                      </p>

                      <div className="mt-2 space-y-0.5">
                        <p
                          className="flex items-center gap-1 text-[11px] truncate"
                          style={{ color: muted }}
                        >
                          <Iconify IconString="mdi:map-marker" Color="red"/>
                          <span className="truncate">{center.address}</span>
                        </p>
                        <p
                          className="flex items-center gap-1 text-[11px]"
                          style={{ color: muted }}
                        >
                          <Iconify IconString="mdi:clock" />
                          {center.schedule}
                        </p>
                      </div>

                      {isActive && (
                        <div
                          className="mt-3 pt-3"
                          style={{ borderTop: `1px solid ${border}` }}
                        >
                          <p
                            className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide"
                            style={{ color: muted }}
                          >
                            Acepta
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {center.acceptedItems.map((item) => (
                              <span
                                key={item}
                                className="rounded-full px-2 py-0.5 text-[10px]"
                                style={{
                                  background: itemBg,
                                  color: muted,
                                  border: `1px solid ${border}`,
                                }}
                              >
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })
                )}
              </div>
            </aside>

            <div className="relative flex-1">
              <MapContainer
                center={[18.48, -69.93]}
                zoom={11}
                zoomControl={false}
                scrollWheelZoom
                zoomSnap={0.5}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; OpenStreetMap contributors'
                  maxZoom={19}
                />

                <MapController center={selected} />

                {COLLECTION_CENTERS.map((center) => (
                  <Marker
                    key={center.id}
                    position={[center.lat, center.lng]}
                    icon={makeIcon(
                      STATUS_COLOR[center.status],
                      selected?.id === center.id
                    )}
                    eventHandlers={{ click: () => setSelected(center) }}
                  >
                    <Popup offset={[0, -8]} className="my-popup">
                      <div
                        style={{ padding: "20px", minWidth: "195px" }}
                      >
                        <p
                          style={{
                            margin: "0 0 4px",
                            fontSize: "13px",
                            fontWeight: 700,
                            color: "#0f172a",
                          }}
                        >
                          {center.title}
                        </p>
                        <p
                          style={{
                            margin: "0 0 3px",
                            fontSize: "11px",
                            color: "#64748b",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <Iconify IconString="solar:pin-bold-duotone" Color="red"/> {center.address}
                        </p>
                        <p
                          style={{
                            margin: "0 0 8px",
                            fontSize: "11px",
                            color: "#64748b",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                         <Iconify IconString="solar:clock-circle-bold-duotone"/>
                        {center.schedule}
                        </p>
                        <div
                          style={{
                            gap: "4px",
                            padding: "3px 9px",
                            borderRadius: "999px",
                            fontSize: "10px",
                            fontWeight: 700,
                            width: "fit-content",
                            background: `${STATUS_COLOR[center.status]}18`,
                            color: STATUS_COLOR[center.status],
                          }}
                        >
                          {STATUS_LABEL[center.status]}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>
        </motion.div>
      </div>

      <style>{`
        .cxum-marker { background: none !important; border: none !important; }

        .leaflet-popup-content-wrapper {
          border-radius: 16px !important;
          padding: 0 !important;
          border: 1px solid #e2e8f0;
          box-shadow: 0 10px 30px rgba(15,23,42,.13) !important;
          overflow: hidden;
        }
        .leaflet-popup-content { margin: 0 !important; }
        .leaflet-popup-tip-container { display: none; }
        .leaflet-control-attribution {
          border-radius: 8px 0 0 0 !important;
          font-size: 9px !important;
          background: rgba(15,23,42,.55) !important;
          color: rgba(255,255,255,.5) !important;
          backdrop-filter: blur(6px);
        }
        .leaflet-control-attribution a { color: #f59e0b !important; }
      `}</style>
    </section>
  );
}
