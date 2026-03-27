import {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { motion, AnimatePresence } from "motion/react";
import { useSettings } from "../../hooks/context/SettingsContext";
import {
  COLLECTION_CENTERS,
  type CollectionCenter,
  type CollectionCenterStatus,
} from "../../types/EnumsCollectionCenters";
import Iconify from "../ModularUI/IconsMock";

// ─── AWS Location Service v2 config ──────────────────────────────────────────
const AWS_REGION = (import.meta.env.VITE_AWS_REGION ?? "us-east-1").trim();

const AWS_MAP_STYLE = (
  import.meta.env.VITE_AWS_MAP_STYLE ?? "Standard"
).trim();

const AWS_API_KEY = (import.meta.env.VITE_AWS_API_KEY ?? "")
  .trim()
  .replace(/^["']|["']$/g, "");

const MAP_STYLE_URL = AWS_API_KEY
  ? `https://maps.geo.${AWS_REGION}.amazonaws.com/v2/styles/${AWS_MAP_STYLE}/descriptor?key=${AWS_API_KEY}`
  : null;

// ─── Status helpers ───────────────────────────────────────────────────────────
const STATUS_LABEL: Record<CollectionCenterStatus, string> = {
  open: "Abierto",
  closing_soon: "Cierra pronto",
  closed: "Cerrado",
};

const STATUS_COLOR: Record<CollectionCenterStatus, string> = {
  open: "#22c55e",
  closing_soon: "#f59e0b",
  closed: "#ef4444",
};

const STATUS_BG: Record<CollectionCenterStatus, string> = {
  open: "rgba(34,197,94,0.12)",
  closing_soon: "rgba(245,158,11,0.12)",
  closed: "rgba(239,68,68,0.12)",
};

type MapLibreMarker = {
  getElement: () => HTMLElement;
  remove: () => void;
};

type MapLibrePopup = {
  remove: () => void;
  getElement: () => HTMLElement | undefined;
};

type MapLibreMap = {
  on: (event: string, cb: (...args: any[]) => void) => void;
  flyTo: (options: {
    center: [number, number];
    zoom?: number;
    duration?: number;
    essential?: boolean;
  }) => void;
  resize: () => void;
  remove: () => void;
};

type MapLibreGlobal = {
  Map: new (options: {
    container: HTMLElement;
    style: string;
    center: [number, number];
    zoom: number;
    attributionControl: boolean;
  }) => MapLibreMap;
  Marker: new (options: {
    element: HTMLElement;
    anchor: string;
  }) => {
    setLngLat: (coords: [number, number]) => {
      addTo: (map: MapLibreMap) => MapLibreMarker;
    };
  };
  Popup: new (options: {
    closeButton?: boolean;
    closeOnClick?: boolean;
    maxWidth?: string;
    offset?: [number, number];
    className?: string;
  }) => {
    setLngLat: (coords: [number, number]) => {
      setHTML: (html: string) => {
        addTo: (map: MapLibreMap) => MapLibrePopup;
      };
    };
  };
};

type MarkerDomRefs = {
  root: HTMLDivElement;
  halo: HTMLDivElement;
  svg: HTMLDivElement;
};

declare global {
  interface Window {
    maplibregl?: MapLibreGlobal;
  }
}

function isBrowser() {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function ensureStyleTag(id: string, css: string) {
  if (!isBrowser() || document.getElementById(id)) return;

  const style = document.createElement("style");
  style.id = id;
  style.textContent = css;
  document.head.appendChild(style);
}

function createMarkerDom(color: string, title: string): MarkerDomRefs {
  const root = document.createElement("div");
  root.title = title;
  root.dataset.hovered = "false";
  root.dataset.active = "false";

  Object.assign(root.style, {
    position: "relative",
    width: "34px",
    height: "46px",
    cursor: "pointer",
    background: "transparent",
    overflow: "visible",
    userSelect: "none",
    WebkitUserSelect: "none",
    transform: "none",
  });

  const halo = document.createElement("div");
  Object.assign(halo.style, {
    position: "absolute",
    left: "50%",
    top: "14px",
    width: "26px",
    height: "26px",
    borderRadius: "999px",
    transform: "translate(-50%, -50%) scale(1)",
    background: color,
    opacity: "0",
    pointerEvents: "none",
    transition: "opacity .18s ease",
  });

  const svg = document.createElement("div");
  svg.innerHTML = `
    <svg width="34" height="46" viewBox="0 0 34 46" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M17 2C9.82 2 4 7.82 4 15c0 9.75 13 27 13 27s13-17.25 13-27C30 7.82 24.18 2 17 2z"
        fill="${color}"
        stroke="white"
        stroke-width="2.2"
        stroke-linejoin="round"
      />
      <circle cx="17" cy="15" r="4.8" fill="white" fill-opacity="0.95" />
    </svg>
  `;

  Object.assign(svg.style, {
    position: "absolute",
    inset: "0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
    transition: "filter .18s ease",
    filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.35))",
    transform: "none",
  });

  root.appendChild(halo);
  root.appendChild(svg);

  return { root, halo, svg };
}

// ─── Map container ────────────────────────────────────────────────────────────
function CXUMMap({
  focusCenter,
  previewCenter,
  isDark,
}: {
  focusCenter: CollectionCenter | null;
  previewCenter: CollectionCenter | null;
  isDark: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Map<string, MapLibreMarker>>(new Map());
  const markerNodesRef = useRef<Map<string, MarkerDomRefs>>(new Map());
  const popupRef = useRef<MapLibrePopup | null>(null);

  const [libReady, setLibReady] = useState<boolean>(() =>
    isBrowser() ? Boolean(window.maplibregl) : false
  );
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState(false);

  const paintMarker = useCallback(
    (
      dom: MarkerDomRefs,
      color: string,
      active: boolean,
      hovered: boolean
    ) => {
      dom.root.style.zIndex = active ? "12" : hovered ? "8" : "1";

      dom.halo.style.opacity = active ? "0.24" : hovered ? "0.14" : "0";
      dom.halo.style.background = color;

      dom.svg.style.filter = active
        ? `drop-shadow(0 4px 14px ${color}88) drop-shadow(0 2px 8px rgba(0,0,0,0.28))`
        : hovered
          ? `drop-shadow(0 3px 11px ${color}66) drop-shadow(0 2px 8px rgba(0,0,0,0.25))`
          : "drop-shadow(0 2px 8px rgba(0,0,0,0.35))";
    },
    []
  );

  useEffect(() => {
    if (!isBrowser() || !MAP_STYLE_URL) return;

    if (window.maplibregl) {
      setLibReady(true);
      return;
    }

    if (!document.getElementById("maplibre-css")) {
      const link = document.createElement("link");
      link.id = "maplibre-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css";
      document.head.appendChild(link);
    }

    const existingScript = document.getElementById(
      "maplibre-js"
    ) as HTMLScriptElement | null;

    if (existingScript) {
      const onLoad = () => setLibReady(true);
      const onError = () => setMapError(true);

      existingScript.addEventListener("load", onLoad);
      existingScript.addEventListener("error", onError);

      return () => {
        existingScript.removeEventListener("load", onLoad);
        existingScript.removeEventListener("error", onError);
      };
    }

    const script = document.createElement("script");
    script.id = "maplibre-js";
    script.src = "https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js";
    script.async = true;

    const onLoad = () => setLibReady(true);
    const onError = () => setMapError(true);

    script.addEventListener("load", onLoad);
    script.addEventListener("error", onError);

    document.head.appendChild(script);

    return () => {
      script.removeEventListener("load", onLoad);
      script.removeEventListener("error", onError);
    };
  }, []);

  useEffect(() => {
    if (
      !isBrowser() ||
      !libReady ||
      !MAP_STYLE_URL ||
      !containerRef.current ||
      mapRef.current ||
      !window.maplibregl
    ) {
      return;
    }

    try {
      ensureStyleTag(
        "cxum-popup-style",
        `
          .cxum-popup .maplibregl-popup-content {
            border-radius: 10px;
            padding: 10px 14px 8px;
            box-shadow: 0 6px 24px rgba(0,0,0,0.22);
            font-family: system-ui, sans-serif;
          }

          .cxum-popup .maplibregl-popup-tip {
            display: none;
          }

          .cxum-popup .maplibregl-popup-close-button {
            font-size: 16px;
            color: #999;
            right: 6px;
            top: 4px;
          }
        `
      );

      const map = new window.maplibregl.Map({
        container: containerRef.current,
        style: MAP_STYLE_URL,
        center: [-69.93, 18.48],
        zoom: 8.5,
        attributionControl: true,
      });

      map.on("load", () => {
        setMapReady(true);

        COLLECTION_CENTERS.forEach((center) => {
          const color = STATUS_COLOR[center.status];
          const dom = createMarkerDom(color, center.title);

          const handleMouseEnter = () => {
            dom.root.dataset.hovered = "true";
            paintMarker(
              dom,
              color,
              dom.root.dataset.active === "true",
              true
            );
          };

          const handleMouseLeave = () => {
            dom.root.dataset.hovered = "false";
            paintMarker(
              dom,
              color,
              dom.root.dataset.active === "true",
              false
            );
          };

          dom.root.addEventListener("mouseenter", handleMouseEnter);
          dom.root.addEventListener("mouseleave", handleMouseLeave);

          const marker = new window.maplibregl.Marker({
            element: dom.root,
            anchor: "bottom",
          })
            .setLngLat([center.lng, center.lat])
            .addTo(map);

          markersRef.current.set(center.id, marker);
          markerNodesRef.current.set(center.id, dom);
        });
      });

      map.on("error", (e: any) => {
        console.error("[CXUMMap] MapLibre error →", e?.error?.message ?? e);
        setMapError(true);
      });

      mapRef.current = map;
    } catch (error) {
      console.error("[CXUMMap] Init failed →", error);
      setMapError(true);
    }
  }, [libReady, paintMarker]);

  useEffect(() => {
    if (!mapRef.current || !mapReady) return;

    const timeout = window.setTimeout(() => {
      mapRef.current?.resize();
    }, 120);

    return () => window.clearTimeout(timeout);
  }, [mapReady]);

  // mover mapa SOLO con click
  useEffect(() => {
    if (!mapRef.current || !mapReady || !focusCenter) return;

    mapRef.current.flyTo({
      center: [focusCenter.lng, focusCenter.lat],
      zoom: 14,
      duration: 1100,
      essential: true,
    });
  }, [focusCenter, mapReady]);

  // activar/desactivar pin visual
  useEffect(() => {
    if (!mapReady) return;

    COLLECTION_CENTERS.forEach((center) => {
      const dom = markerNodesRef.current.get(center.id);
      if (!dom) return;

      const color = STATUS_COLOR[center.status];
      const isActive = previewCenter?.id === center.id;
      const isHovered = dom.root.dataset.hovered === "true";

      dom.root.dataset.active = isActive ? "true" : "false";
      paintMarker(dom, color, isActive, isHovered);
    });
  }, [previewCenter, mapReady, paintMarker]);

  // popup según hover o seleccionado
  useEffect(() => {
    if (!mapRef.current || !mapReady || !window.maplibregl) return;

    if (popupRef.current) {
      popupRef.current.remove();
      popupRef.current = null;
    }

    if (!previewCenter) return;

    const map = mapRef.current;
    const color = STATUS_COLOR[previewCenter.status];

    const popup = new window.maplibregl.Popup({
      closeButton: true,
      closeOnClick: false,
      maxWidth: "240px",
      offset: [0, -42],
      className: "cxum-popup",
    })
      .setLngLat([previewCenter.lng, previewCenter.lat])
      .setHTML(`
        <strong style="display:block;font-size:12.5px;font-weight:700;color:#111;line-height:1.3;margin-bottom:3px">
          ${escapeHtml(previewCenter.title)}
        </strong>
        <span style="font-size:11px;color:#666;line-height:1.3">
          ${escapeHtml(previewCenter.subtitle)}
        </span>
      `)
      .addTo(map);

    const popupContent = popup
      .getElement()
      ?.querySelector(".maplibregl-popup-content") as HTMLDivElement | null;

    if (popupContent) {
      popupContent.style.border = `1.5px solid ${color}66`;
    }

    popupRef.current = popup;
  }, [previewCenter, mapReady]);

  useEffect(() => {
    return () => {
      popupRef.current?.remove();
      popupRef.current = null;

      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current.clear();
      markerNodesRef.current.clear();

      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  if (mapError || !MAP_STYLE_URL) {
    return (
      <StaticMapFallback
        selected={previewCenter ?? focusCenter}
        isDark={isDark}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      aria-label="Mapa de centros de acopio"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        minHeight: "400px",
      }}
    />
  );
}

// ─── Static SVG fallback ──────────────────────────────────────────────────────
function StaticMapFallback({
  selected,
  isDark,
}: {
  selected: CollectionCenter | null;
  isDark: boolean;
}) {
  const BOUNDS = { minLat: 18.1, maxLat: 19.98, minLng: -72.05, maxLng: -68.2 };
  const WIDTH = 720;
  const HEIGHT = 460;

  const projectPoint = (lat: number, lng: number) => ({
    x: ((lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * WIDTH,
    y:
      (1 - (lat - BOUNDS.minLat) / (BOUNDS.maxLat - BOUNDS.minLat)) * HEIGHT,
  });

  const sea = isDark ? "#0b1220" : "#c2d5e8";
  const land = isDark ? "#1a2a3a" : "#b5c9af";
  const grid = isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.04)";

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: sea }}>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-full w-full"
        preserveAspectRatio="xMidYMid slice"
      >
        <rect width={WIDTH} height={HEIGHT} fill={sea} />

        {Array.from({ length: 15 }, (_, i) => (
          <line
            key={`v${i}`}
            x1={(WIDTH / 14) * i}
            y1={0}
            x2={(WIDTH / 14) * i}
            y2={HEIGHT}
            stroke={grid}
            strokeWidth="1"
          />
        ))}

        {Array.from({ length: 9 }, (_, i) => (
          <line
            key={`h${i}`}
            x1={0}
            y1={(HEIGHT / 8) * i}
            x2={WIDTH}
            y2={(HEIGHT / 8) * i}
            stroke={grid}
            strokeWidth="1"
          />
        ))}

        <ellipse
          cx={WIDTH * 0.44}
          cy={HEIGHT * 0.54}
          rx={WIDTH * 0.36}
          ry={HEIGHT * 0.27}
          fill={land}
          opacity="0.88"
        />
        <ellipse
          cx={WIDTH * 0.54}
          cy={HEIGHT * 0.47}
          rx={WIDTH * 0.2}
          ry={HEIGHT * 0.15}
          fill={land}
          opacity="0.72"
        />
        <ellipse
          cx={WIDTH * 0.35}
          cy={HEIGHT * 0.61}
          rx={WIDTH * 0.13}
          ry={HEIGHT * 0.1}
          fill={land}
          opacity="0.6"
        />

        {COLLECTION_CENTERS.map((center) => {
          const { x, y } = projectPoint(center.lat, center.lng);
          const isSelected = selected?.id === center.id;
          const color = STATUS_COLOR[center.status];

          return (
            <g key={center.id} transform={`translate(${x},${y})`}>
              {isSelected && (
                <circle cx={0} cy={-16} r={20} fill={color} opacity="0.18" />
              )}

              <path
                d="M0,-32 C11,-32 18,-22 18,-14 C18,0 0,16 0,16 C0,14 -18,0 -18,-14 C-18,-22 -11,-32 0,-32Z"
                fill={color}
                stroke="white"
                strokeWidth="2"
                style={{
                  filter: isSelected
                    ? `drop-shadow(0 3px 10px ${color}bb)`
                    : "drop-shadow(0 1px 3px rgba(0,0,0,0.3))",
                }}
              />

              <circle cx={0} cy={-15} r={5} fill="white" opacity="0.9" />
            </g>
          );
        })}

        {selected &&
          (() => {
            const { x, y } = projectPoint(selected.lat, selected.lng);
            const color = STATUS_COLOR[selected.status];
            const label =
              selected.title.length > 24
                ? `${selected.title.slice(0, 23)}…`
                : selected.title;

            return (
              <g transform={`translate(${x},${y - 78})`}>
                <rect
                  x={-78}
                  y={-32}
                  width={156}
                  height={48}
                  rx={9}
                  fill={isDark ? "#1c2535" : "white"}
                  stroke={color}
                  strokeWidth="1.5"
                  style={{
                    filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.22))",
                  }}
                />

                <text
                  x={0}
                  y={-13}
                  textAnchor="middle"
                  fontSize="11.5"
                  fontWeight="700"
                  fill={isDark ? "white" : "#111"}
                  fontFamily="system-ui"
                >
                  {label}
                </text>

                <text
                  x={0}
                  y={5}
                  textAnchor="middle"
                  fontSize="9.5"
                  fill={isDark ? "rgba(255,255,255,0.5)" : "#666"}
                  fontFamily="system-ui"
                >
                  {selected.subtitle}
                </text>

                <line
                  x1={0}
                  y1={16}
                  x2={0}
                  y2={30}
                  stroke={color}
                  strokeWidth="1.5"
                />
              </g>
            );
          })()}
      </svg>

      <div
        className="absolute bottom-3 right-3 rounded-lg px-2.5 py-1 text-xs"
        style={{
          background: isDark
            ? "rgba(255,255,255,0.07)"
            : "rgba(0,0,0,0.05)",
          color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.3)",
        }}
      >
        {MAP_STYLE_URL
          ? "Cargando mapa…"
          : "Configura VITE_AWS_API_KEY para el mapa real"}
      </div>
    </div>
  );
}

// ─── Center card ──────────────────────────────────────────────────────────────
function CenterCard({
  center,
  isActive,
  onClick,
  onHoverStart,
  onHoverEnd,
  isDark,
}: {
  center: CollectionCenter;
  isActive: boolean;
  onClick: () => void;
  onHoverStart: () => void;
  onHoverEnd: () => void;
  isDark: boolean;
}) {
  const color = STATUS_COLOR[center.status];
  const bg = STATUS_BG[center.status];

  return (
    <motion.button
      type="button"
      aria-pressed={isActive}
      onMouseDown={(e) => e.preventDefault()}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      onFocus={onHoverStart}
      onBlur={onHoverEnd}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      className="relative w-full cursor-pointer overflow-hidden rounded-xl border-none p-4 text-left outline-none"
      style={{
        background: isActive
          ? isDark
            ? "rgba(255,255,255,0.07)"
            : "rgba(0,0,0,0.04)"
          : isDark
            ? "rgba(255,255,255,0.025)"
            : "rgba(0,0,0,0.015)",
        boxShadow: isActive
          ? `inset 0 0 0 1.5px ${color}55`
          : isDark
            ? "inset 0 0 0 1px rgba(255,255,255,0.06)"
            : "inset 0 0 0 1px rgba(0,0,0,0.06)",
        transition: "background .25s, box-shadow .25s",
      }}
      whileHover={{ scale: 1.012 }}
      whileTap={{ scale: 0.985 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        className="absolute bottom-3 left-0 top-3 w-[3px] rounded-full"
        style={{ background: color }}
        animate={{ opacity: isActive ? 1 : 0, scaleY: isActive ? 1 : 0.3 }}
        transition={{ duration: 0.3 }}
      />

      <div className="flex items-start justify-between gap-2 pl-3">
        <div className="flex min-w-0 flex-col gap-1">
          <span
            className={`truncate text-sm font-bold leading-tight ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            {center.title}
          </span>

          <span
            className={`text-xs leading-tight ${
              isDark ? "text-white/45" : "text-slate-500"
            }`}
          >
            {center.subtitle}
          </span>

          <div
            className={`mt-1.5 flex items-center gap-1 ${
              isDark ? "text-white/30" : "text-slate-400"
            }`}
          >
            <Iconify Size={11} IconString="solar:pin-bold-duotone" />
            <span className="truncate text-xs">{center.address}</span>
          </div>

          <div
            className={`flex items-center gap-1 ${
              isDark ? "text-white/30" : "text-slate-400"
            }`}
          >
            <Iconify Size={11} IconString="duo-icons:clock" />
            <span className="text-xs">{center.schedule}</span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <span
            className="whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold"
            style={{ color, background: bg }}
          >
            {STATUS_LABEL[center.status]}
          </span>

          <Iconify
            Size={14}
            IconString="si:chevron-right-duotone"
            Style={{
              color: isActive
                ? color
                : isDark
                  ? "rgba(255,255,255,0.2)"
                  : "rgba(0,0,0,0.2)",
            }}
          />
        </div>
      </div>
    </motion.button>
  );
}

// ─── Main section ─────────────────────────────────────────────────────────────
export default function CollectionMap() {
  const { theme } = useSettings();
  const isDark = theme === "dark";

  const sectionRef = useRef<HTMLElement | null>(null);

  const [inView, setInView] = useState(false);
  const [selected, setSelected] = useState<CollectionCenter | null>(null);
  const [query, setQuery] = useState("");
  const [hovered, setHovered] = useState<CollectionCenter | null>(null);

  const activeCenter = hovered ?? selected;

  const handleSelect = useCallback((center: CollectionCenter) => {
    setSelected(center);
  }, []);

  useEffect(() => {
    ensureStyleTag(
      "cards-scroll-style",
      `
        .cards-scroll {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .cards-scroll::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }
      `
    );
  }, []);

  useEffect(() => {
    const element = sectionRef.current;
    if (!element || !("IntersectionObserver" in window)) {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.06 }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const filtered = useMemo(() => {
    const normalizedQuery = query.toLowerCase().trim();

    if (!normalizedQuery) return COLLECTION_CENTERS;

    return COLLECTION_CENTERS.filter((center) => {
      return (
        center.title.toLowerCase().includes(normalizedQuery) ||
        center.subtitle.toLowerCase().includes(normalizedQuery) ||
        center.address.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [query]);

  useEffect(() => {
    if (hovered && !filtered.some((center) => center.id === hovered.id)) {
      setHovered(null);
    }
  }, [filtered, hovered]);

  const headV = {
    hidden: { opacity: 0, y: 24, filter: "blur(12px)" },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.7,
        delay: i * 0.1,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    }),
    exit: {
      opacity: 0,
      y: -16,
      filter: "blur(8px)",
      transition: {
        duration: 0.4,
        ease: [0.76, 0, 0.24, 1] as const,
      },
    },
  };

  return (
    <section
      id="Centros"
      ref={sectionRef}
      className={`w-full px-6 py-28 md:px-16 lg:px-24 ${
        isDark ? "bg-[#05070b]" : "bg-[#f4f4ef]"
      }`}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-12">
        <div className="flex flex-col items-center gap-3 text-center">
          <motion.h2
            className={`font-black tracking-tight ${
              isDark ? "text-white" : "text-slate-950"
            }`}
            style={{ fontSize: "clamp(2rem,5vw,3.6rem)" }}
            custom={0}
            variants={headV}
            initial="hidden"
            animate={inView ? "visible" : "exit"}
          >
            Encuentra un{" "}
            <span style={{ color: "#f59e0b" }}>Centro de Acopio</span>
          </motion.h2>

          <motion.p
            className={`max-w-md text-base leading-relaxed ${
              isDark ? "text-white/45" : "text-slate-500"
            }`}
            custom={1}
            variants={headV}
            initial="hidden"
            animate={inView ? "visible" : "exit"}
          >
            Lleva tus cuadernos usados al punto más cercano y ayúdanos a
            transformar vidas.
          </motion.p>

          <motion.div
            className="h-0.5 rounded-full"
            style={{ backgroundColor: "#f59e0b" }}
            initial={{ width: 0, opacity: 0 }}
            animate={inView ? { width: 48, opacity: 1 } : { width: 0, opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>

        <motion.div
          className="flex flex-col overflow-hidden rounded-2xl lg:flex-row"
          style={{
            boxShadow: isDark
              ? "0 0 0 1px rgba(255,255,255,0.07),0 24px 64px rgba(0,0,0,0.55)"
              : "0 0 0 1px rgba(0,0,0,0.07),0 16px 48px rgba(0,0,0,0.1)",
            minHeight: 520,
          }}
          initial={{ opacity: 0, y: 40, filter: "blur(16px)" }}
          animate={
            inView
              ? { opacity: 1, y: 0, filter: "blur(0px)" }
              : { opacity: 0, y: 40, filter: "blur(16px)" }
          }
          transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          <div
            className="flex w-full shrink-0 flex-col lg:w-[360px]"
            style={{
              background: isDark ? "#0d1117" : "#ffffff",
              borderRight: isDark
                ? "1px solid rgba(255,255,255,0.06)"
                : "1px solid rgba(0,0,0,0.06)",
            }}
          >
            <div className="p-4 pb-3">
              <div
                className="flex items-center gap-2 rounded-xl px-3 py-2.5"
                style={{
                  background: isDark
                    ? "rgba(255,255,255,0.05)"
                    : "rgba(0,0,0,0.04)",
                  border: isDark
                    ? "1px solid rgba(255,255,255,0.08)"
                    : "1px solid rgba(0,0,0,0.08)",
                }}
              >
                <Iconify
                  Size={14}
                  IconString="solar:card-search-bold-duotone"
                  Style={{
                    color: isDark
                      ? "rgba(255,255,255,0.3)"
                      : "rgba(0,0,0,0.3)",
                    flexShrink: 0,
                  }}
                />

                <input
                  type="text"
                  placeholder="Buscar centro de acopio…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 border-none bg-transparent text-sm outline-none"
                  style={{
                    color: isDark ? "rgba(255,255,255,0.85)" : "#1e293b",
                  }}
                />

                <AnimatePresence>
                  {query && (
                    <motion.button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setQuery("");
                      }}
                      className="flex cursor-pointer items-center justify-center border-none bg-transparent p-0.5 outline-none"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ duration: 0.18 }}
                    >
                      <Iconify
                        IconString="solar:close-circle-bold-duotone"
                        Size={14}
                        Style={{
                          color: isDark
                            ? "rgba(255,255,255,0.3)"
                            : "rgba(0,0,0,0.3)",
                        }}
                      />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="px-4 pb-2">
              <span
                className="text-xs"
                style={{
                  color: isDark
                    ? "rgba(255,255,255,0.25)"
                    : "rgba(0,0,0,0.3)",
                }}
              >
                {filtered.length} centro{filtered.length !== 1 ? "s" : ""}{" "}
                encontrado{filtered.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="cards-scroll flex max-h-[460px] flex-1 flex-col gap-2 overflow-y-auto px-3 pb-4">
              <AnimatePresence mode="popLayout">
                {filtered.length === 0 ? (
                  <motion.div
                    key="empty"
                    className="flex flex-col items-center justify-center gap-3 py-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Iconify
                      Size={32}
                      IconString="solar:map-point-search-bold-duotone"
                      Style={{
                        color: isDark
                          ? "rgba(255,255,255,0.12)"
                          : "rgba(0,0,0,0.12)",
                      }}
                    />

                    <p
                      className="text-sm"
                      style={{
                        color: isDark
                          ? "rgba(255,255,255,0.3)"
                          : "rgba(0,0,0,0.3)",
                      }}
                    >
                      Sin resultados
                    </p>
                  </motion.div>
                ) : (
                  filtered.map((center) => (
                    <motion.div
                      key={center.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{
                        duration: 0.22,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                    >
                      <CenterCard
                        center={center}
                        isActive={activeCenter?.id === center.id}
                        onClick={() => handleSelect(center)}
                        onHoverStart={() => setHovered(center)}
                        onHoverEnd={() =>
                          setHovered((prev) =>
                            prev?.id === center.id ? null : prev
                          )
                        }
                        isDark={isDark}
                      />
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="relative flex-1" style={{ minHeight: 460 }}>
            <CXUMMap
              focusCenter={selected}
              previewCenter={activeCenter}
              isDark={isDark}
            />

            <AnimatePresence>
              {activeCenter && (
                <motion.div
                  className="pointer-events-none absolute left-3 right-3 top-3 z-10 rounded-xl px-4 py-3 lg:right-auto lg:max-w-xs"
                  style={{
                    background: isDark
                      ? "rgba(13,17,23,0.9)"
                      : "rgba(255,255,255,0.93)",
                    backdropFilter: "blur(14px)",
                    WebkitBackdropFilter: "blur(14px)",
                    boxShadow: isDark
                      ? "0 4px 24px rgba(0,0,0,0.55)"
                      : "0 4px 20px rgba(0,0,0,0.12)",
                    border: `1px solid ${STATUS_COLOR[activeCenter.status]}55`,
                  }}
                  initial={{ opacity: 0, y: -10, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.96 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  <p
                    className={`text-xs font-bold leading-snug ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}
                  >
                    {activeCenter.title}
                  </p>

                  <p
                    className={`text-xs leading-snug ${
                      isDark ? "text-white/50" : "text-slate-500"
                    }`}
                  >
                    {activeCenter.subtitle}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}