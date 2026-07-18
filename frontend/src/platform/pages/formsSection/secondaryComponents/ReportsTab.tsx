import { motion } from "framer-motion";
import type { reportsTabObject } from "../types";
import Iconify from "../../../../components/modularUI/IconsMock";
import { useMemo} from "react";
import { getCategorySummaries, getConditionalProbability, getHistogram, getNumericSummaries, getTimeSeries } from "../../../donations/analytics";
import { AdminSelect, asPercent, BarChart, BoxPlot, compactNumber, LineChart, PieChart, ScatterChart } from "./minorsComponents";



export default function ReportsTab({ renderFilters, cardStyle, text, muted, selectedResponses, selectedForm, target, scatterXFieldId, scatterYFieldId, setScatterXFieldId, setScatterYFieldId, numericFields, inputStyle, isDark, conditionFields, conditionFieldId, setConditionFieldId, setConditionValue, conditionValue, outcomeFieldId, setOutcomeFieldId, setTarget } : reportsTabObject) {

      const numericSummaries = useMemo(() => getNumericSummaries(selectedForm, selectedResponses, target), [selectedForm, selectedResponses, target]);
      const categorySummaries = useMemo(() => getCategorySummaries(selectedForm, selectedResponses), [selectedForm, selectedResponses]);
      const timeSeries = useMemo(() => getTimeSeries(selectedResponses), [selectedResponses]);
      const conditionValues = useMemo(() => {
          if (!conditionFieldId) return [];
          return [...new Set(selectedResponses.map((response) => String(response.values[conditionFieldId] ?? "")).filter(Boolean))]
            .sort((a, b) => a.localeCompare(b));
        }, [conditionFieldId, selectedResponses]);
      const conditionalProbability = useMemo(
        () => getConditionalProbability(selectedResponses, conditionFieldId, conditionValue, outcomeFieldId, target),
        [conditionFieldId, conditionValue, outcomeFieldId, selectedResponses, target],
      );

    
        const scatterPoints = useMemo(() => {
    if (!scatterXFieldId || !scatterYFieldId) return [];
    return selectedResponses
      .map((response) => ({
        x: Number(response.values[scatterXFieldId]),
        y: Number(response.values[scatterYFieldId]),
        label: new Date(response.submittedAt).toLocaleDateString("es-DO"),
      }))
      .filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y));
  }, [scatterXFieldId, scatterYFieldId, selectedResponses]);

    
    return (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {renderFilters()}
          <div className="grid md:grid-cols-4 gap-3">
            {[
              { label: "Respuestas", value: selectedResponses.length, icon: "solar:inbox-archive-bold-duotone", color: "#3b82f6" },
              { label: "Campos", value: selectedForm.fields.length, icon: "solar:checklist-bold-duotone", color: "#f59e0b" },
              { label: "Fuentes QR", value: selectedResponses.filter((item) => item.source === "qr").length, icon: "solar:qr-code-bold-duotone", color: "#22c55e" },
              { label: "Campos numericos", value: numericSummaries.length, icon: "solar:calculator-bold-duotone", color: "#ef4444" },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border p-4" style={cardStyle}>
                <Iconify IconString={item.icon} Size={20} Style={{ color: item.color }} />
                <p className="text-2xl font-black mt-2" style={{ color: text }}>{item.value}</p>
                <p className="text-xs font-bold" style={{ color: muted }}>{item.label}</p>
              </div>
            ))}
          </div>

          <div className="grid xl:grid-cols-2 gap-4">
            <div className="rounded-2xl border p-5" style={cardStyle}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-black" style={{ color: text }}>Tendencia de registros</h2>
                <span className="text-xs font-bold" style={{ color: muted }}>lineas</span>
              </div>
              <LineChart data={timeSeries.length ? timeSeries : [{ label: "Sin datos", value: 0 }]} color="#f59e0b" />
            </div>
            {categorySummaries.map((summary) => {
              const usePie = summary.counts.length > 0 && summary.counts.length <= 6;
              return (
                <div key={summary.field.id} className="rounded-2xl border p-5" style={cardStyle}>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-black" style={{ color: text }}>{summary.field.label}</h2>
                    <span className="text-xs font-bold" style={{ color: muted }}>automatico: {usePie ? "circular" : "barras"}</span>
                  </div>
                  {usePie ? <PieChart data={summary.counts} /> : <BarChart data={summary.counts} color="#3b82f6" />}
                </div>
              );
            })}
            {numericSummaries.map((summary) => (
              <div key={`histogram-${summary.field.id}`} className="rounded-2xl border p-5" style={cardStyle}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-black" style={{ color: text }}>Distribucion de {summary.field.label}</h2>
                  <span className="text-xs font-bold" style={{ color: muted }}>automatico: histograma</span>
                </div>
                <BarChart data={getHistogram(selectedResponses, summary.field.id)} color="#22c55e" />
              </div>
            ))}
            {scatterPoints.length > 0 && (
              <div className="rounded-2xl border p-5" style={cardStyle}>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                  <div>
                    <h2 className="font-black" style={{ color: text }}>Relacion entre variables</h2>
                    <p className="text-xs" style={{ color: muted }}>Compara dos cantidades y ayuda a detectar valores atipicos.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 min-w-64">
                    <AdminSelect value={scatterXFieldId ?? ""} onChange={setScatterXFieldId} options={numericFields.map((field) => ({ label: `X: ${field.label}`, value: field.id }))} style={inputStyle} />
                    <AdminSelect value={scatterYFieldId ?? ""} onChange={setScatterYFieldId} options={numericFields.map((field) => ({ label: `Y: ${field.label}`, value: field.id }))} style={inputStyle} />
                  </div>
                </div>
                <ScatterChart data={scatterPoints} color="#ef4444" />
              </div>
            )}
          </div>

          {conditionFields.length > 0 && numericFields.length > 0 && (
            <div className="rounded-2xl border p-5" style={cardStyle}>
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
                <div>
                  <h2 className="font-black" style={{ color: text }}>Probabilidad condicional</h2>
                  <p className="text-xs mt-1" style={{ color: muted }}>Probabilidad empirica de alcanzar una cantidad dentro de un grupo.</p>
                </div>
                <div className="grid sm:grid-cols-3 gap-2 flex-1 max-w-3xl">
                  <AdminSelect
                    value={conditionFieldId ?? ""}
                    onChange={(value) => { setConditionFieldId(value); setConditionValue(""); }}
                    options={conditionFields.map((field) => ({ label: `Condicion: ${field.label}`, value: field.id }))}
                    style={inputStyle}
                  />
                  <AdminSelect
                    value={conditionValue ?? ""}
                    onChange={setConditionValue}
                    options={[{ label: "Seleccionar valor", value: "" }, ...conditionValues.map((value) => ({ label: value, value }))]}
                    style={inputStyle}
                  />
                  <AdminSelect
                    value={outcomeFieldId}
                    onChange={setOutcomeFieldId}
                    options={numericFields.map((field) => ({ label: `Resultado: ${field.label}`, value: field.id }))}
                    style={inputStyle}
                  />
                </div>
              </div>
              <div className="mt-4 rounded-xl p-4" style={{ color: "#3b82f6", background: "rgba(59,130,246,0.1)" }}>
                <p className="text-lg font-black">P(resultado &gt;= {target} | condicion) = {asPercent(conditionalProbability.probability)}</p>
                <p className="text-xs font-bold mt-1">{conditionalProbability.successCount} de {conditionalProbability.conditionedCount} respuestas del grupo cumplen la meta.</p>
              </div>
            </div>
          )}

          <div className="grid xl:grid-cols-2 gap-4">
            {numericSummaries.map((summary) => (
              <div key={summary.field.id} className="rounded-2xl border p-5" style={cardStyle}>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div>
                    <h2 className="font-black" style={{ color: text }}>{summary.field.label}</h2>
                    <p className="text-xs" style={{ color: muted }}>Estadisticos descriptivos y probabilidad empirica</p>
                  </div>
                  <label className="flex items-center gap-2 text-xs font-bold" style={{ color: muted }}>
                    Meta
                    <input
                      type="number"
                      value={target}
                      onChange={(event) => setTarget(Number(event.target.value) || 0)}
                      className="w-20 rounded-xl border px-2 py-1.5 outline-none"
                      style={inputStyle}
                    />
                  </label>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                  {[
                    ["Suma", compactNumber(summary.sum)],
                    ["Media", compactNumber(summary.mean)],
                    ["Mediana", compactNumber(summary.median)],
                    ["Moda", summary.mode === null ? "N/A" : compactNumber(summary.mode)],
                    ["Varianza", compactNumber(summary.variance)],
                    ["Desv. est.", compactNumber(summary.standardDeviation)],
                    ["Q1", compactNumber(summary.q1)],
                    ["Q3", compactNumber(summary.q3)],
                    ["P10", compactNumber(summary.p10)],
                    ["P90", compactNumber(summary.p90)],
                    ["Rango IQR", compactNumber(summary.iqr)],
                    ["Coef. variacion", asPercent(summary.coefficientVariation)],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl p-3" style={{ background: isDark ? "rgba(255,255,255,0.04)" : "#f8fafc" }}>
                      <p className="text-[10px] font-black uppercase" style={{ color: muted }}>{label}</p>
                      <p className="text-sm font-black mt-1" style={{ color: text }}>{value}</p>
                    </div>
                  ))}
                </div>
                <BoxPlot min={summary.min} q1={summary.q1} median={summary.median} q3={summary.q3} max={summary.max} />
                <div className="mt-4 rounded-xl p-3 text-sm font-bold" style={{ color: "#22c55e", background: "rgba(34,197,94,0.1)" }}>
                  P(X &gt;= {target}) = {asPercent(summary.probabilityAtLeastTarget)} con los filtros actuales.
                </div>
                <div className="mt-2 rounded-xl p-3 text-sm font-bold" style={{ color: "#3b82f6", background: "rgba(59,130,246,0.1)" }}>
                  Esperanza: faltan {compactNumber(Math.max(0, target - summary.sum))} unidades; a la media actual se requieren {summary.mean > 0 ? Math.ceil(Math.max(0, target - summary.sum) / summary.mean) : "N/A"} registros mas.
                </div>
              </div>
            ))}
          </div>
        </motion.div>
    )
}