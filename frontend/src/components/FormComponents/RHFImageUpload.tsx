import { Controller, useFormContext } from "react-hook-form";
import type { FieldValues, Path } from "react-hook-form";
import { useState, useRef } from "react";
import { useSettings } from "../../hooks/context/SettingsContext";
import Iconify from "../modularUI/IconsMock";
import { uploadImage } from "../../platform/APIs/uploadImage";

interface RHFImageUploadProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
}

export default function RHFImageUpload<T extends FieldValues>({
  name,
  label,
  helperText,
  required,
  disabled,
}: RHFImageUploadProps<T>) {
  const { control, setValue } = useFormContext<T>();
  const { theme } = useSettings();
  const isDark = theme === "dark";
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = async (file: File, onChange: (value: string) => void) => {
    // Validar tipo
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      setUploadError("Tipo de archivo no válido. Usa JPG, PNG, WEBP o GIF");
      return;
    }

    // Validar tamaño (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Archivo muy grande. Máximo 5MB");
      return;
    }

    setUploading(true);
    setUploadError("");

    try {
      const publicUrl = await uploadImage(file);
      onChange(publicUrl);
      setValue(name, publicUrl as T[Path<T>]);
    } catch (err) {
      console.error(err);
      setUploadError(err instanceof Error ? err.message : "Error al subir imagen");
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !uploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent, onChange: (value: string) => void) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled || uploading) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0], onChange);
    }
  };

  const labelColor = isDark ? "rgba(255,255,255,0.45)" : "#64748b";

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value, onChange }, fieldState: { error } }) => (
        <div className="flex flex-col gap-1.5">
          <label
            className="text-xs font-semibold tracking-wider uppercase select-none"
            style={{ color: labelColor }}
          >
            {label}{required && <span className="ml-1" style={{ color: "#f59e0b" }}>*</span>}
          </label>

          <div className="flex flex-col gap-3">
            {/* Preview */}
            {value && (
              <div className="relative rounded-xl overflow-hidden border" style={{ borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)" }}>
                <img
                  src={value}
                  alt="Preview"
                  className="w-full h-48 object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    onChange("");
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  disabled={disabled || uploading}
                  className="absolute top-2 right-2 w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
                  style={{ background: "rgba(239,68,68,0.9)", color: "#fff" }}
                >
                  <Iconify Size={16} IconString="solar:trash-bin-trash-bold" Style={{ color: "#fff" }} />
                </button>
              </div>
            )}

            {/* Drag & Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, onChange)}
              onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
              className="relative rounded-xl border-2 border-dashed p-8 transition-all cursor-pointer"
              style={{
                background: isDragging
                  ? isDark ? "rgba(245,158,11,0.08)" : "rgba(245,158,11,0.05)"
                  : isDark ? "rgba(255,255,255,0.02)" : "#fafafa",
                borderColor: isDragging
                  ? "#f59e0b"
                  : isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
                opacity: disabled || uploading ? 0.5 : 1,
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file, onChange);
                }}
                disabled={disabled || uploading}
                className="hidden"
              />

              <div className="flex flex-col items-center gap-3">
                {uploading ? (
                  <>
                    <svg className="animate-spin h-10 w-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" style={{ color: "#f59e0b" }}>
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-sm font-semibold" style={{ color: "#f59e0b" }}>
                      Subiendo imagen...
                    </p>
                  </>
                ) : (
                  <>
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center"
                      style={{ background: isDark ? "rgba(245,158,11,0.1)" : "rgba(245,158,11,0.08)", border: "2px solid rgba(245,158,11,0.3)" }}
                    >
                      <Iconify Size={32} IconString="solar:cloud-upload-bold-duotone" Style={{ color: "#f59e0b" }} />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold mb-1" style={{ color: isDark ? "#fff" : "#0f172a" }}>
                        {isDragging ? "Suelta la imagen aquí" : "Arrastra una imagen o haz clic"}
                      </p>
                      <p className="text-xs" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#94a3b8" }}>
                        JPG, PNG, WEBP o GIF (máx. 5MB)
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* URL input alternativo */}
            {!uploading && (
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Iconify Size={14} IconString="solar:link-bold" Style={{ color: isDark ? "rgba(255,255,255,0.3)" : "#94a3b8" }} />
                </span>
                <input
                  type="url"
                  value={value || ""}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder="O pega una URL de imagen..."
                  disabled={disabled}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border text-xs font-medium outline-none transition-all disabled:opacity-50"
                  style={{
                    background: isDark ? "rgba(255,255,255,0.03)" : "#ffffff",
                    borderColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.1)",
                    color: isDark ? "rgba(255,255,255,0.7)" : "#334155",
                  }}
                />
              </div>
            )}
          </div>

          {/* Error/Helper */}
          <div className="min-h-4">
            {error ? (
              <p className="text-xs font-medium flex items-center gap-1" style={{ color: "#f87171" }}>
                <span>⚠</span> {error.message}
              </p>
            ) : uploadError ? (
              <p className="text-xs font-medium flex items-center gap-1" style={{ color: "#f87171" }}>
                <span>⚠</span> {uploadError}
              </p>
            ) : helperText ? (
              <p className="text-xs" style={{ color: isDark ? "rgba(255,255,255,0.3)" : "#94a3b8" }}>
                {helperText}
              </p>
            ) : null}
          </div>
        </div>
      )}
    />
  );
}
