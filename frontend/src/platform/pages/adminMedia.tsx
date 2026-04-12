import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSettings } from "../../hooks/context/SettingsContext";
import Iconify from "../../components/modularUI/IconsMock";
import { listImages, deleteImage, uploadImage, type ImageItem } from "../APIs/uploadImage";
import { useAuth } from "../components/AuthContextComps";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";

export default function AdminMediaPage() {
  const { hasPermission } = useAuth();
  const { theme } = useSettings();
  const isDark = theme === "dark";
  const canManage = hasPermission("canManageNews");

  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const res = await listImages();
      setImages(res.images);
    } catch (err) {
      console.error("Error al cargar imágenes:", err);
      const errorMessage = err instanceof Error ? err.message : "Error desconocido";
      alert(`Error al cargar imágenes: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleDelete = async (key: string) => {
    if (!window.confirm("¿Eliminar esta imagen? Esta acción no se puede deshacer.")) return;

    try {
      await deleteImage(key);
      setImages((prev) => prev.filter((img) => img.key !== key));
      if (selectedImage?.key === key) setSelectedImage(null);
    } catch (err) {
      console.error(err);
      alert("Error al eliminar imagen");
    }
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      await uploadImage(file);
      await fetchImages();
    } catch (err) {
      console.error(err);
      alert("Error al subir imagen");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (!canManage || uploading) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleUpload(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (canManage && !uploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    alert("URL copiada al portapapeles");
  };

  const filtered = images.filter((img) =>
    img.key.toLowerCase().includes(search.toLowerCase())
  );

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("es-DO", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const cardStyle = {
    background: isDark ? "rgba(255,255,255,0.025)" : "#ffffff",
    borderColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
    boxShadow: isDark ? "none" : "0 1px 6px rgba(0,0,0,0.06)",
  };

  const inputStyle = {
    background: isDark ? "rgba(255,255,255,0.03)" : "#ffffff",
    borderColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.1)",
    color: isDark ? "rgba(255,255,255,0.7)" : "#334155",
  } as React.CSSProperties;

  return (
    <div
      className="p-4 sm:p-6 max-w-7xl mx-auto"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-0 sm:justify-between mb-6 sm:mb-8">
        <div>
          <h1 className="font-black text-xl sm:text-2xl tracking-tight" style={{ color: isDark ? "#fff" : "#0f172a" }}>
            Galería de Medios
          </h1>
          <p className="text-sm mt-1" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#64748b" }}>
            {images.length} imágenes · {(images.reduce((acc, img) => acc + img.size, 0) / (1024 * 1024)).toFixed(2)} MB total
          </p>
        </div>
        {canManage && (
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUpload(file);
              }}
              disabled={uploading}
              className="hidden"
            />
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black text-white"
              style={{
                background: uploading ? "#94a3b8" : "linear-gradient(135deg, #f59e0b, #fb923c)",
                boxShadow: "0 4px 20px rgba(245,158,11,0.3)",
                pointerEvents: uploading ? "none" : "auto",
              }}
            >
              {uploading ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Subiendo...
                </>
              ) : (
                <>
                  <Iconify Size={16} IconString="solar:upload-bold-duotone" Style={{ color: "#fff" }} />
                  Subir Imagen
                </>
              )}
            </motion.div>
          </label>
        )}
      </div>

      {/* Drag overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
            style={{ background: "rgba(245,158,11,0.1)", backdropFilter: "blur(8px)" }}
          >
            <div
              className="rounded-3xl p-12 border-4 border-dashed"
              style={{ borderColor: "#f59e0b", background: isDark ? "rgba(15,17,23,0.95)" : "rgba(255,255,255,0.95)" }}
            >
              <Iconify Size={64} IconString="solar:cloud-upload-bold-duotone" Style={{ color: "#f59e0b" }} />
              <p className="text-xl font-black mt-4" style={{ color: "#f59e0b" }}>
                Suelta la imagen aquí
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <div className="relative mb-6">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <Iconify Size={16} IconString="solar:magnifier-linear" Style={{ color: isDark ? "rgba(255,255,255,0.3)" : "#94a3b8" }} />
        </span>
        <input
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm font-medium outline-none focus:ring-2 focus:ring-amber-500/30 transition-all"
          placeholder="Buscar imágenes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={inputStyle}
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-20">
          <p className="text-sm font-medium" style={{ color: isDark ? "rgba(255,255,255,0.3)" : "#94a3b8" }}>
            Cargando imágenes...
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Iconify Size={48} IconString="solar:gallery-bold-duotone" Style={{ color: isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0" }} />
          <p className="text-lg font-black mt-4" style={{ color: isDark ? "rgba(255,255,255,0.2)" : "#cbd5e1" }}>
            {search ? "Sin resultados" : "No hay imágenes"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((img) => (
              <motion.div
                key={img.key}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={() => setSelectedImage(img)}
                className="rounded-xl border overflow-hidden cursor-pointer group transition-all hover:scale-105"
                style={cardStyle}
              >
                <div className="relative aspect-square">
                  <img src={img.url} alt={img.key} className="w-full h-full object-cover" />
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    style={{ background: "rgba(0,0,0,0.6)" }}
                  >
                    <Iconify Size={32} IconString="solar:eye-bold-duotone" Style={{ color: "#fff" }} />
                  </div>
                </div>
                <div className="p-2">
                  <p className="text-xs font-medium truncate" style={{ color: isDark ? "rgba(255,255,255,0.6)" : "#64748b" }}>
                    {img.key.split("/").pop()}
                  </p>
                  <p className="text-[10px] mt-0.5" style={{ color: isDark ? "rgba(255,255,255,0.3)" : "#94a3b8" }}>
                    {formatSize(img.size)}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modal de detalle */}
      <AnimatePresence>
        {selectedImage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)" }}
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl rounded-3xl border overflow-hidden"
              style={{ background: isDark ? "#0f1117" : "#ffffff", borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", maxHeight: "90vh" }}
            >
              <SimpleBar style={{ maxHeight: "90vh" }}>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-black text-lg" style={{ color: isDark ? "#fff" : "#0f172a" }}>
                      Detalles de la Imagen
                    </h3>
                    <button
                      onClick={() => setSelectedImage(null)}
                      className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
                      style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#94a3b8" }}
                    >
                      <Iconify Size={18} IconString="solar:close-circle-bold-duotone" Style={{ color: "currentColor" }} />
                    </button>
                  </div>

                  <div className="rounded-xl overflow-hidden border mb-4" style={{ borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)" }}>
                    <img src={selectedImage.url} alt={selectedImage.key} className="w-full" />
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-semibold mb-1" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#94a3b8" }}>
                        Nombre
                      </p>
                      <p className="text-sm font-medium" style={{ color: isDark ? "#fff" : "#0f172a" }}>
                        {selectedImage.key.split("/").pop()}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold mb-1" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#94a3b8" }}>
                        URL
                      </p>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={selectedImage.url}
                          readOnly
                          className="flex-1 px-3 py-2 rounded-lg border text-xs font-mono"
                          style={{
                            background: isDark ? "rgba(255,255,255,0.03)" : "#f8fafc",
                            borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
                            color: isDark ? "rgba(255,255,255,0.6)" : "#64748b",
                          }}
                        />
                        <button
                          onClick={() => copyToClipboard(selectedImage.url)}
                          className="px-3 py-2 rounded-lg border text-xs font-bold transition-colors"
                          style={{
                            background: isDark ? "rgba(245,158,11,0.1)" : "rgba(245,158,11,0.08)",
                            borderColor: "rgba(245,158,11,0.3)",
                            color: "#f59e0b",
                          }}
                        >
                          Copiar
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs font-semibold mb-1" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#94a3b8" }}>
                          Tamaño
                        </p>
                        <p className="text-sm font-medium" style={{ color: isDark ? "#fff" : "#0f172a" }}>
                          {formatSize(selectedImage.size)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold mb-1" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#94a3b8" }}>
                          Subida
                        </p>
                        <p className="text-sm font-medium" style={{ color: isDark ? "#fff" : "#0f172a" }}>
                          {formatDate(selectedImage.lastModified)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {canManage && (
                    <div className="flex gap-3 mt-6 pt-6 border-t" style={{ borderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }}>
                      <button
                        onClick={() => {
                          handleDelete(selectedImage.key);
                        }}
                        className="flex-1 py-2.5 rounded-xl border text-sm font-bold transition-colors"
                        style={{ color: "#ef4444", borderColor: "rgba(239,68,68,0.25)" }}
                      >
                        Eliminar
                      </button>
                      <button
                        onClick={() => window.open(selectedImage.url, "_blank")}
                        className="flex-1 py-2.5 rounded-xl text-sm font-black text-white"
                        style={{ background: "linear-gradient(135deg, #f59e0b, #fb923c)" }}
                      >
                        Abrir en nueva pestaña
                      </button>
                    </div>
                  )}
                </div>
              </SimpleBar>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
