import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import CXUMLOGO from "../../assets/LogoCXUM.png";
import { useSettings } from "../../hooks/context/SettingsContext";
import Iconify from "../modularUI/IconsMock";

export default function PublicCertificatePage() {
  const { certificateId: routeCertificateId = "" } = useParams();
  const [searchParams] = useSearchParams();
  const certificateId = routeCertificateId
    || searchParams.get("certificateId")
    || searchParams.get("guid")
    || searchParams.get("id")
    || "";
  const { theme } = useSettings();
  const isDark = theme === "dark";
  const apiBase = import.meta.env.VITE_API_URL ?? "";
  const certificateApiUrl = useMemo(() => {
    if (!apiBase || !certificateId) return "";
    return `${apiBase.replace(/\/$/, "")}/certificates/${encodeURIComponent(certificateId)}`;
  }, [apiBase, certificateId]);
  const [result, setResult] = useState<{ source: string; pdfUrl: string; error: string } | null>(null);
  const currentResult = result?.source === certificateApiUrl ? result : null;
  const pdfUrl = currentResult?.pdfUrl ?? "";
  const error = !certificateApiUrl
    ? "No se recibio un identificador valido para cargar el certificado."
    : currentResult?.error ?? "";
  const status: "loading" | "ready" | "error" = !certificateApiUrl
    ? "error"
    : !currentResult
      ? "loading"
      : currentResult.error
        ? "error"
        : "ready";

  useEffect(() => {
    if (!certificateApiUrl) return;

    const controller = new AbortController();
    let objectUrl = "";

    fetch(certificateApiUrl, {
      signal: controller.signal,
      headers: { Accept: "application/pdf" },
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(response.status === 404 ? "Certificado no encontrado." : "No se pudo cargar el certificado.");
        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);
        setResult({ source: certificateApiUrl, pdfUrl: objectUrl, error: "" });
      })
      .catch((requestError: unknown) => {
        if (controller.signal.aborted) return;
        setResult({
          source: certificateApiUrl,
          pdfUrl: "",
          error: requestError instanceof Error ? requestError.message : "No se pudo cargar el certificado.",
        });
      });

    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [certificateApiUrl]);

  return (
    <main className={`min-h-screen ${isDark ? "bg-[#05070b] text-white" : "bg-slate-50 text-slate-950"}`}>
      <header
        className="sticky top-0 z-20 border-b px-3 py-3 backdrop-blur-xl sm:px-6"
        style={{
          borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)",
          background: isDark ? "rgba(5,7,11,0.9)" : "rgba(248,250,252,0.9)",
        }}
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <img src={CXUMLOGO} alt="Cuadernos X Un Manana" className="h-9 w-9 shrink-0 rounded-full sm:h-10 sm:w-10" />
            <div className="min-w-0">
              <p className="truncate text-sm font-black sm:text-base">Cuadernos X Un Manana</p>
              <p className={`text-xs font-semibold ${isDark ? "text-white/45" : "text-slate-500"}`}>Certificado digital</p>
            </div>
          </Link>
          <span
            className="block max-w-full truncate rounded-xl border px-3 py-1.5 text-[11px] font-black sm:max-w-sm sm:text-xs"
            style={{ borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(15,23,42,0.12)" }}
            title={certificateId}
          >
            {certificateId || "Sin identificador"}
          </span>
        </div>
      </header>

      <section className="mx-auto flex min-h-[calc(100dvh-117px)] max-w-6xl flex-col gap-3 p-3 sm:min-h-[calc(100dvh-73px)] sm:gap-4 sm:p-6">
        {status === "loading" && (
          <div
            className="flex min-h-[55dvh] items-center justify-center rounded-2xl border p-6 text-center text-sm font-black"
            style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.1)" }}
          >
            Cargando certificado digital...
          </div>
        )}

        {status === "ready" && pdfUrl && (
          <>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
              <a
                href={pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border px-4 text-xs font-black"
                style={{
                  borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(15,23,42,0.12)",
                  color: isDark ? "#ffffff" : "#0f172a",
                }}
              >
                <Iconify Size={16} IconString="solar:eye-bold-duotone" Style={{ color: "#f59e0b" }} />
                Abrir PDF
              </a>
              <a
                href={pdfUrl}
                download={`certificado-${certificateId || "digital"}.pdf`}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-xs font-black text-white"
                style={{ background: "linear-gradient(135deg, #f59e0b, #fb923c)" }}
              >
                <Iconify Size={16} IconString="solar:download-bold-duotone" Style={{ color: "#ffffff" }} />
                Descargar
              </a>
            </div>

            <div
              className="min-h-0 flex-1 overflow-hidden rounded-2xl border bg-white shadow-sm"
              style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.1)" }}
            >
              <iframe
                title={`Certificado ${certificateId}`}
                src={pdfUrl}
                className="h-[68dvh] min-h-[430px] w-full border-0 sm:h-[78dvh] sm:min-h-[560px]"
              />
            </div>
          </>
        )}

        {status === "error" && (
          <div
            className="flex min-h-[55dvh] items-center justify-center rounded-2xl border p-6 text-center text-sm font-bold"
            style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.1)" }}
          >
            {error || "No se pudo cargar el certificado digital."}
          </div>
        )}
      </section>
    </main>
  );
}
