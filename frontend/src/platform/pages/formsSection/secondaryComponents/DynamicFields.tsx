import type { ChangeEvent, CSSProperties } from "react";
import { motion } from "framer-motion";
import Iconify from "../../../../components/modularUI/IconsMock";
import { AdminSelect, ConfigLabel, ConfigSectionHeader } from "../secondaryComponents/MinorsComponents";
import { CONFIG_DESCRIPTIONS, FIELD_TYPES, MODE_OPTIONS, OPERATORS, SELECT_DISPLAY_OPTIONS, SELECT_MODE_OPTIONS, STATUS_OPTIONS, type dynamicFieldObject } from "../types";
import IconifyPicker from "./IconifyPicker";

function fieldInput(
  inputStyle: CSSProperties | undefined,
  muted: string,
  label: string,
  value: string | number | undefined,
  onChange: (value: string) => void,
  type = "text",
) {
  return (
    <label className="grid gap-1.5">
      <ConfigLabel title={label} description={CONFIG_DESCRIPTIONS[label] ?? "Configura como se comporta este valor en el formulario final."} muted={muted} />
      <input
        type={type}
        value={value ?? ""}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value)}
        className={`
          rounded-xl border px-3 py-2 text-sm outline-none
          ${type === "number"
            ? "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            : ""
          }
        `}
        style={inputStyle}
      />
    </label>
  );
}

export default function DynamicFields( { cardStyle, inputStyle, text, muted, selectedForm, updateForm, addField, removeField, updateField, updateFieldSection, sectionOptions, isDark }: dynamicFieldObject ) {
    const splitRecordField = selectedForm.fields.find((field) =>
      field.type === "select" && field.selectionMode === "multiple" && field.createRecordPerSelection,
    );
    
    return (
         <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="rounded-2xl border p-4 sm:p-5" style={cardStyle}>
              <ConfigSectionHeader
                icon="solar:document-text-bold-duotone"
                title="Encabezado y publicacion"
                description="Estos valores construyen la cabecera del formulario publico, controlan su acceso y determinan que datos se usaran para identificar a la persona y su ubicacion."
                text={text}
                muted={muted}
              />
              <div className="grid md:grid-cols-2 gap-4">
                {fieldInput(inputStyle, muted, "Titulo", selectedForm.title, (value) => updateForm({ title: value }))}
                {fieldInput(inputStyle, muted, "Slug publico", selectedForm.slug, (value) => updateForm({ slug: value.toLowerCase().replaceAll(" ", "-") }))}
                {fieldInput(inputStyle, muted, "Fecha del evento", selectedForm.eventDate, (value) => updateForm({ eventDate: value || undefined }), "date")}
                <div className="grid gap-1.5">
                  <ConfigLabel title="Icono del encabezado" description={CONFIG_DESCRIPTIONS["Icono del encabezado"]} muted={muted} />
                  <IconifyPicker
                    value={selectedForm.headerIcon}
                    onChange={(value) => updateForm({ headerIcon: value })}
                    inputStyle={inputStyle}
                    text={text}
                    muted={muted}
                    isDark={isDark}
                  />
                </div>
                <label className="grid gap-1.5 md:col-span-2">
                  <ConfigLabel title="Descripcion" description="Aparece debajo del titulo y explica el objetivo, destino o condiciones de la donacion." muted={muted} />
                  <textarea
                    value={selectedForm.description}
                    onChange={(event) => updateForm({ description: event.target.value })}
                    className="rounded-xl border px-3 py-2 text-sm outline-none min-h-24"
                    style={inputStyle}
                  />
                </label>
                <label className="grid gap-1.5">
                  <ConfigLabel title="Estado" description="Decide si el formulario puede verse y recibir respuestas desde el frontoffice." muted={muted} />
                  <AdminSelect value={selectedForm.status} options={STATUS_OPTIONS} onChange={(value) => updateForm({ status: value })} style={inputStyle} />
                </label>
                <label className="grid gap-1.5">
                  <ConfigLabel title="Modo de presentacion" description="Define si la persona avanza por etapas o completa todos los campos juntos." muted={muted} />
                  <AdminSelect value={selectedForm.mode} options={MODE_OPTIONS} onChange={(value) => updateForm({ mode: value })} style={inputStyle} />
                </label>
                <label className="grid gap-1.5">
                  <ConfigLabel title="Campo prioritario" description="En modo guiado sera la primera etapa destacada y se mostrara en mayor tamano." muted={muted} />
                  <AdminSelect
                    value={selectedForm.primaryFieldId ?? ""}
                    onChange={(value) => updateForm({ primaryFieldId: value || undefined })}
                    options={[
                      { label: "Sin prioridad", value: "", description: "El flujo comenzara directamente con la primera seccion." },
                      ...selectedForm.fields.map((field) => ({ label: field.label, value: field.id, description: `Prioridad ${field.priority} · Seccion ${field.section}` })),
                    ]}
                    className="text-sm"
                    style={inputStyle}
                  />
                </label>
                <label className="grid gap-1.5">
                  <ConfigLabel title="Identifica quien responde" description="Su respuesta se mostrara como identificador principal en el bucket y las exportaciones." muted={muted} />
                  <AdminSelect
                    value={selectedForm.respondentFieldId ?? ""}
                    onChange={(value) => updateForm({
                      respondentFieldId: value || undefined,
                      respondentSubmissionLimit: value ? selectedForm.respondentSubmissionLimit : undefined,
                      fields: value && selectedForm.respondentSubmissionLimit
                        ? selectedForm.fields.map((field) => field.id === value ? { ...field, required: true } : field)
                        : selectedForm.fields,
                    })}
                    options={[
                      { label: "Sin identificador", value: "", description: "Las respuestas apareceran como no especificadas." },
                      ...selectedForm.fields
                        .filter((field) => field.type !== "select" || field.selectionMode !== "multiple")
                        .map((field) => ({ label: field.label, value: field.id, description: `Tipo ${FIELD_TYPES.find((type) => type.value === field.type)?.label ?? field.type}` })),
                    ]}
                    className="text-sm"
                    style={inputStyle}
                  />
                </label>
                <label className="grid gap-1.5">
                  <ConfigLabel
                    title="Limite por identificador"
                    description={splitRecordField
                      ? `Desactiva "Registro por seleccion" en ${splitRecordField.label} para configurar un limite.`
                      : CONFIG_DESCRIPTIONS["Limite por identificador"]}
                    muted={muted}
                  />
                  <div className="relative">
                    <input
                      type="number"
                      min={1}
                      max={100000}
                      step={1}
                      disabled={!selectedForm.respondentFieldId || Boolean(splitRecordField)}
                      value={selectedForm.respondentSubmissionLimit ?? ""}
                      placeholder={splitRecordField ? "Requiere modo ilimitado" : selectedForm.respondentFieldId ? "Sin limite" : "Selecciona un identificador"}
                      onChange={(event) => {
                        const rawValue = event.target.value;
                        const parsedValue = Number(rawValue);
                        const limit = rawValue && Number.isFinite(parsedValue)
                          ? Math.min(100000, Math.max(1, Math.floor(parsedValue)))
                          : undefined;
                        updateForm({
                          respondentSubmissionLimit: limit,
                          fields: limit
                            ? selectedForm.fields.map((field) => field.id === selectedForm.respondentFieldId ? { ...field, required: true } : field)
                            : selectedForm.fields,
                        });
                      }}
                      className="w-full rounded-xl border px-3 py-2 pr-12 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-55 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      style={inputStyle}
                    />
                    {selectedForm.respondentSubmissionLimit && (
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase" style={{ color: muted }}>
                        veces
                      </span>
                    )}
                  </div>
                </label>
                <label className="grid gap-1.5">
                  <ConfigLabel title="Campo de ubicacion" description="Alimenta el filtro de lugar y la columna de ubicacion en reportes y bucket." muted={muted} />
                  <AdminSelect
                    value={selectedForm.locationFieldId ?? ""}
                    onChange={(value) => updateForm({ locationFieldId: value || undefined })}
                    options={[
                      { label: "Sin ubicacion", value: "", description: "La ubicacion se registrara como no especificada." },
                      ...selectedForm.fields.map((field) => ({ label: field.label, value: field.id, description: `Seccion ${field.section}` })),
                    ]}
                    className="text-sm"
                    style={inputStyle}
                  />
                </label>
                <div className="md:col-span-2">
                  {fieldInput(inputStyle, muted, "Mensaje final", selectedForm.thankYouMessage, (value) => updateForm({ thankYouMessage: value }))}
                </div>
                <label className="grid gap-1.5 md:col-span-2">
                  <ConfigLabel title="Llenado recurrente" description={CONFIG_DESCRIPTIONS["Llenado recurrente"]} muted={muted} />
                  <span className="min-h-11 rounded-xl border px-3 flex items-center justify-between gap-3" style={inputStyle}>
                    <span>
                      <span className="block text-xs font-black" style={{ color: text }}>{selectedForm.allowRepeatSubmissions ? "Permitir otra respuesta" : "Finalizar despues del envio"}</span>
                      <span className="block text-[11px] mt-0.5" style={{ color: muted }}>El registro enviado se conserva; solo se limpian los controles para comenzar uno nuevo.</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={Boolean(selectedForm.allowRepeatSubmissions)}
                      onChange={(event) => updateForm({ allowRepeatSubmissions: event.target.checked })}
                      className="w-4 h-4 shrink-0 accent-amber-500"
                    />
                  </span>
                </label>
              </div>
            </div>

            <div className="rounded-2xl border p-4 sm:p-5" style={cardStyle}>
              <ConfigSectionHeader
                icon="solar:widget-add-bold-duotone"
                title="Campos dinamicos"
                description="Cada tarjeta representa un control del formulario final. Su etiqueta, tipo, orden, validaciones y condiciones se reflejan inmediatamente en la vista previa."
                text={text}
                muted={muted}
                action={<button onClick={addField} className="px-3 py-2 rounded-xl text-xs font-black text-white flex items-center gap-1.5 shrink-0" style={{ background: "#22c55e" }}>
                  <Iconify IconString="solar:add-circle-bold" Size={15} />
                  Campo
                </button>}
              />

              <div className="space-y-3">
                {[...selectedForm.fields].sort((a, b) => a.priority - b.priority).map((field, fieldIndex) => (
                  <div key={field.id} className="rounded-2xl border p-4" style={{ borderColor: cardStyle.borderColor, background: isDark ? "rgba(255,255,255,0.018)" : "#f8fafc" }}>
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4 pb-4 border-b" style={{ borderColor: cardStyle.borderColor }}>
                      <div className="flex items-start gap-3 min-w-0">
                        <span className="w-9 h-9 shrink-0 rounded-xl grid place-items-center text-xs font-black" style={{ color: "#f59e0b", background: "rgba(245,158,11,0.12)" }}>
                          {String(fieldIndex + 1).padStart(2, "0")}
                        </span>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-black truncate" style={{ color: text }}>{field.label || "Campo sin titulo"}</h3>
                            {field.required && <span className="px-2 py-0.5 rounded-md text-[10px] font-black" style={{ color: "#ef4444", background: "rgba(239,68,68,0.1)" }}>Obligatorio</span>}
                            {field.createRecordPerSelection && <span className="px-2 py-0.5 rounded-md text-[10px] font-black" style={{ color: "#2563eb", background: "rgba(37,99,235,0.1)" }}>Una fila por seleccion</span>}
                            {field.repeatSubmenuPerSelection && <span className="px-2 py-0.5 rounded-md text-[10px] font-black" style={{ color: "#7c3aed", background: "rgba(124,58,237,0.1)" }}>Submenu repetido</span>}
                          </div>
                          <p className="text-xs mt-1 leading-5" style={{ color: muted }}>
                            Se mostrara como {FIELD_TYPES.find((type) => type.value === field.type)?.label.toLowerCase() ?? field.type} en la seccion “{field.section || "General"}”, posicion {field.priority}.
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-black uppercase px-2 py-1 rounded-lg shrink-0" style={{ color: muted, background: isDark ? "rgba(255,255,255,0.05)" : "rgba(15,23,42,0.05)" }}>
                        {field.condition ? "Visibilidad condicional" : "Siempre visible"}
                      </span>
                    </div>
                    <div className="grid md:grid-cols-3 gap-3">
                      {fieldInput({...inputStyle}, muted, "Etiqueta", field.label, (value) => updateField(field.id, { label: value }))}
                      <label className="grid gap-1.5">
                        <ConfigLabel title="Tipo de campo" description="Cambia el control, teclado y validaciones que vera la persona." muted={muted} />
                        <AdminSelect
                          value={field.type}
                          onChange={(value) => updateField(field.id, {
                            type: value,
                            ...(value !== "select" ? {
                              selectDisplay: undefined,
                              selectionMode: undefined,
                              createRecordPerSelection: undefined,
                              repeatSubmenuPerSelection: undefined,
                              optionSubmenus: undefined,
                            } : {}),
                          })}
                          options={FIELD_TYPES}
                          className="text-sm"
                          style={inputStyle}
                        />
                      </label>
                      <label className="grid gap-1.5">
                        <ConfigLabel title="Submenu / seccion" description="Reutiliza el mismo nombre para colocar varios campos dentro de una sola etapa." muted={muted} />
                        <AdminSelect
                          value={field.section || "General"}
                          onChange={(value) => updateFieldSection(field.id, value)}
                          options={sectionOptions}
                          allowCustom
                          customCreateLabel="Crear submenu"
                          customValueMaxLength={80}
                          placeholder="Buscar o crear submenu"
                          className="text-sm"
                          style={inputStyle}
                        />
                      </label>
                      {fieldInput(inputStyle, muted, "Prioridad", field.priority, (value) => updateField(field.id, { priority: Number(value) || 1 }), "number")}
                      {fieldInput(inputStyle, muted, "Placeholder", field.placeholder, (value) => updateField(field.id, { placeholder: value }), "text")}
                      {fieldInput(inputStyle, muted, "Limite caracteres", field.maxLength, (value) => updateField(field.id, { maxLength: value ? Number(value) : undefined }), "number")}
                      {fieldInput(inputStyle, muted, "Min", field.min, (value) => updateField(field.id, { min: value ? Number(value) : undefined }), "number")}
                      {fieldInput(inputStyle, muted, "Max", field.max, (value) => updateField(field.id, { max: value ? Number(value) : undefined }), "number")}
                    </div>

                    <div className="grid md:grid-cols-4 gap-5 mt-4">
                      <label className="grid gap-1.5">
                        <ConfigLabel title="Obligatorio" description="Impide avanzar o enviar hasta completar este campo visible." muted={muted} />
                        <span className="h-10 rounded-xl border px-3 flex items-center justify-between" style={inputStyle}>
                          <span className="text-xs font-black" style={{ color: text }}>{field.required ? "Requerido" : "Opcional"}</span>
                          <input
                            type="checkbox"
                            checked={field.required}
                            disabled={field.id === selectedForm.respondentFieldId && Boolean(selectedForm.respondentSubmissionLimit)}
                            onChange={(event) => updateField(field.id, { required: event.target.checked })}
                            title={field.id === selectedForm.respondentFieldId && selectedForm.respondentSubmissionLimit ? "El identificador limitado debe ser obligatorio" : undefined}
                            className="w-4 h-4 accent-amber-500 disabled:cursor-not-allowed disabled:opacity-60"
                          />
                        </span>
                      </label>
                      {fieldInput(inputStyle, muted, "Ayuda", field.helper, (value) => updateField(field.id, { helper: value }))}
                      {(field.type === "select") && (
                        <label className="grid gap-1.5 md:col-span-2 ml-5">
                          <ConfigLabel title="Opciones separadas por coma" description="Cada elemento sera una alternativa. Ejemplo: Cuadernos, Lapices, Mochilas." muted={muted} />
                          <input
                            value={(field.options ?? []).join(", ")}
                            placeholder="Cuadernos, Lapices, Mochilas"
                            onChange={(event) => {
                              const options = event.target.value.split(",").map((item) => item.trimStart());
                              const optionSubmenus = Object.fromEntries(
                                Object.entries(field.optionSubmenus ?? {}).filter(([option]) => options.includes(option)),
                              );
                              updateField(field.id, {
                                options,
                                optionSubmenus,
                                repeatSubmenuPerSelection: Object.keys(optionSubmenus).length > 0 ? field.repeatSubmenuPerSelection : undefined,
                              });
                            }}
                            onBlur={() => {
                              const options = (field.options ?? []).map((item) => item.trim()).filter(Boolean);
                              const optionSubmenus = Object.fromEntries(
                                Object.entries(field.optionSubmenus ?? {}).filter(([option]) => options.includes(option)),
                              );
                              updateField(field.id, {
                                options,
                                optionSubmenus,
                                repeatSubmenuPerSelection: Object.keys(optionSubmenus).length > 0 ? field.repeatSubmenuPerSelection : undefined,
                              });
                            }}
                            className="rounded-xl border px-3 py-2 text-sm outline-none"
                            style={inputStyle}
                          />
                        </label>
                      )}
                    </div>

                    {field.type === "select" && (
                      <div className="mt-4 rounded-2xl border p-4" style={{ borderColor: cardStyle.borderColor, background: isDark ? "rgba(255,255,255,0.02)" : "#ffffff" }}>
                        <div className="grid md:grid-cols-[minmax(0,300px)_1fr] gap-4 items-start">
                          <div className="grid gap-3">
                            <label className="grid gap-1.5">
                              <ConfigLabel title="Diseño de opciones" description="Cambia la presentacion visual sin alterar las alternativas almacenadas." muted={muted} />
                              <AdminSelect
                                value={field.selectDisplay ?? "autocomplete"}
                                onChange={(value) => updateField(field.id, { selectDisplay: value })}
                                options={SELECT_DISPLAY_OPTIONS}
                                className="text-sm"
                                style={inputStyle}
                              />
                            </label>
                            <label className="grid gap-1.5">
                              <ConfigLabel title="Cantidad de selecciones" description="Define si la respuesta guarda una alternativa o una lista de varias alternativas." muted={muted} />
                              <AdminSelect
                                value={field.selectionMode ?? "single"}
                                onChange={(value) => {
                                  const nextFields = selectedForm.fields.map((item) => item.id === field.id
                                    ? {
                                        ...item,
                                        selectionMode: value,
                                        createRecordPerSelection: value === "multiple" ? item.createRecordPerSelection : undefined,
                                        repeatSubmenuPerSelection: value === "multiple" ? item.repeatSubmenuPerSelection : undefined,
                                      }
                                    : item);
                                  updateForm({
                                    fields: nextFields,
                                    ...(value === "multiple" && selectedForm.respondentFieldId === field.id
                                      ? { respondentFieldId: undefined, respondentSubmissionLimit: undefined }
                                      : {}),
                                  });
                                }}
                                options={SELECT_MODE_OPTIONS}
                                className="text-sm"
                                style={inputStyle}
                              />
                            </label>
                            {field.selectionMode === "multiple" && (
                              <label className="grid gap-1.5">
                                <ConfigLabel
                                  title="Registro por seleccion"
                                  description={selectedForm.respondentSubmissionLimit
                                    ? "No está disponible porque el formulario tiene un limite por identificador."
                                    : splitRecordField && splitRecordField.id !== field.id
                                      ? "Otro campo ya divide las respuestas; solo puede existir uno para evitar combinaciones ambiguas."
                                      : CONFIG_DESCRIPTIONS["Registro por seleccion"]}
                                  muted={muted}
                                />
                                <span className="min-h-11 rounded-xl border px-3 flex items-center justify-between gap-3" style={inputStyle}>
                                  <span>
                                    <span className="block text-xs font-black" style={{ color: text }}>{field.createRecordPerSelection ? "Crear filas independientes" : "Conservar una sola respuesta"}</span>
                                    <span className="block text-[11px] mt-0.5" style={{ color: muted }}>{field.repeatSubmenuPerSelection ? "Cada fila usara los datos completados para su opcion." : "Los demas campos se repetiran en cada fila creada."}</span>
                                  </span>
                                  <input
                                    type="checkbox"
                                    checked={Boolean(field.createRecordPerSelection)}
                                    disabled={!field.createRecordPerSelection && (
                                      Boolean(selectedForm.respondentSubmissionLimit)
                                      || Boolean(splitRecordField && splitRecordField.id !== field.id)
                                    )}
                                    onChange={(event) => updateField(field.id, {
                                      createRecordPerSelection: event.target.checked || undefined,
                                      repeatSubmenuPerSelection: event.target.checked ? field.repeatSubmenuPerSelection : undefined,
                                    })}
                                    className="w-4 h-4 shrink-0 accent-amber-500 disabled:cursor-not-allowed disabled:opacity-55"
                                  />
                                </span>
                              </label>
                            )}
                            {field.createRecordPerSelection && (
                              <label className="grid gap-1.5">
                                <ConfigLabel
                                  title="Repetir submenu por seleccion"
                                  description={Object.keys(field.optionSubmenus ?? {}).length === 0
                                    ? "Asigna primero al menos una opcion a un submenu para habilitar esta estrategia."
                                    : CONFIG_DESCRIPTIONS["Repetir submenu por seleccion"]}
                                  muted={muted}
                                />
                                <span className="min-h-11 rounded-xl border px-3 flex items-center justify-between gap-3" style={inputStyle}>
                                  <span>
                                    <span className="block text-xs font-black" style={{ color: text }}>{field.repeatSubmenuPerSelection ? "Un paso para cada opcion" : "Un solo paso compartido"}</span>
                                    <span className="block text-[11px] mt-0.5" style={{ color: muted }}>Funciona igual con autocomplete y tarjetas.</span>
                                  </span>
                                  <input
                                    type="checkbox"
                                    checked={Boolean(field.repeatSubmenuPerSelection)}
                                    disabled={!field.repeatSubmenuPerSelection && Object.keys(field.optionSubmenus ?? {}).length === 0}
                                    onChange={(event) => {
                                      const enabled = event.target.checked;
                                      const repeatedSections = new Set(Object.values(field.optionSubmenus ?? {}));
                                      const primaryField = selectedForm.fields.find((item) => item.id === selectedForm.primaryFieldId);
                                      updateForm({
                                        fields: selectedForm.fields.map((item) => item.id === field.id
                                          ? { ...item, repeatSubmenuPerSelection: enabled || undefined }
                                          : item),
                                        primaryFieldId: enabled && selectedForm.mode === "guided" && primaryField && repeatedSections.has(primaryField.section)
                                          ? undefined
                                          : selectedForm.primaryFieldId,
                                      });
                                    }}
                                    className="w-4 h-4 shrink-0 accent-amber-500 disabled:cursor-not-allowed disabled:opacity-55"
                                  />
                                </span>
                              </label>
                            )}
                          </div>

                          {field.selectDisplay === "cards" || field.createRecordPerSelection ? (
                            <div>
                              <ConfigLabel
                                title={field.selectDisplay === "cards" ? "Destino de cada tarjeta" : "Destino de cada opcion"}
                                description={field.repeatSubmenuPerSelection
                                  ? "El submenu configurado se repetira como un paso independiente para cada opcion marcada."
                                  : field.selectionMode === "multiple"
                                    ? "Cada alternativa marcada habilita su rama; la persona avanza por los submenus seleccionados con Continuar."
                                    : "Al elegirla se mostrara el submenu configurado."}
                                muted={muted}
                              />
                              <div className="grid sm:grid-cols-2 gap-2 mt-2">
                                {(field.options ?? []).filter(Boolean).map((option) => (
                                  <div key={option} className="rounded-xl border p-3" style={{ borderColor: cardStyle.borderColor }}>
                                    <p className="text-xs font-black mb-2 wrap-break-word" style={{ color: text }}>{option}</p>
                                    <AdminSelect
                                      value={field.optionSubmenus?.[option] ?? ""}
                                      onChange={(section) => {
                                        const nextMappings = { ...(field.optionSubmenus ?? {}) };
                                        if (section) nextMappings[option] = section;
                                        else delete nextMappings[option];
                                        updateField(field.id, {
                                          optionSubmenus: nextMappings,
                                          repeatSubmenuPerSelection: Object.keys(nextMappings).length > 0 ? field.repeatSubmenuPerSelection : undefined,
                                        });
                                      }}
                                      options={[
                                        { label: "Sin submenu", value: "", description: "La opcion no habilita ni repite campos adicionales." },
                                        ...sectionOptions
                                          .filter((section) => section.value !== field.section)
                                          .map((section) => ({ ...section, description: `Navegar a ${section.label}. ${section.description ?? ""}` })),
                                      ]}
                                      placeholder="Elegir submenu"
                                      className="text-xs"
                                      style={inputStyle}
                                    />
                                  </div>
                                ))}
                              </div>
                              {(field.options ?? []).filter(Boolean).length === 0 && (
                                <p className="mt-2 text-xs font-bold" style={{ color: muted }}>Primero agrega opciones separadas por coma.</p>
                              )}
                            </div>
                          ) : (
                            <div className="rounded-xl p-3 text-xs leading-5" style={{ color: muted, background: isDark ? "rgba(255,255,255,0.04)" : "#f8fafc" }}>
                              La persona podra escribir para filtrar y {field.selectionMode === "multiple" ? "marcar varias alternativas, visibles como etiquetas removibles." : "seleccionar una coincidencia."}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-3 mt-3 pt-3 border-t" style={{ borderColor: cardStyle.borderColor }}>
                      <label className="grid gap-1.5">
                        <ConfigLabel title="Mostrar si campo" description="Oculta este campo hasta que otra respuesta cumpla la regla." muted={muted} />
                        <AdminSelect
                          value={field.condition?.fieldId ?? ""}
                          onChange={(value) => updateField(field.id, {
                            condition: value
                              ? { fieldId: value, operator: "equals", value: "" }
                              : undefined,
                          })}
                          options={[
                            { label: "Siempre visible", value: "", description: "No depende de ninguna respuesta previa." },
                            ...selectedForm.fields.filter((item) => item.id !== field.id).map((item) => ({ label: item.label, value: item.id, description: `Tipo ${FIELD_TYPES.find((type) => type.value === item.type)?.label ?? item.type}` })),
                          ]}
                          className="text-sm"
                          style={inputStyle}
                        />
                      </label>
                      {field.condition && (
                        <>
                          <label className="grid gap-1.5">
                            <ConfigLabel title="Operador" description="Define como se comparara la respuesta con el valor esperado." muted={muted} />
                            <AdminSelect
                              value={field.condition.operator}
                              onChange={(value) => {
                                if (!field.condition) return;
                                updateField(field.id, {
                                  condition: {
                                    fieldId: field.condition.fieldId,
                                    operator: value,
                                    value: field.condition.value,
                                  },
                                });
                              }}
                              options={OPERATORS}
                              className="text-sm"
                              style={inputStyle}
                            />
                          </label>
                          {fieldInput(inputStyle, muted, "Valor esperado", field.condition.value, (value) => {
                            if (!field.condition) return;
                            updateField(field.id, {
                              condition: {
                                fieldId: field.condition.fieldId,
                                operator: field.condition.operator,
                                value,
                              },
                            });
                          })}
                        </>
                      )}
                      <div className="flex md:justify-end items-end">
                        <button
                          onClick={() => removeField(field.id)}
                          className="px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5"
                          style={{ color: "#ef4444", background: "rgba(239,68,68,0.1)" }}
                        >
                          <Iconify IconString="solar:trash-bin-trash-bold-duotone" Size={15} />
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>
    )
}
