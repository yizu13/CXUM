import { apiFetch } from "./api";

export interface UploadImageResponse {
  uploadUrl: string;
  publicUrl: string;
  key: string;
  expiresIn: number;
}

export interface ImageItem {
  key: string;
  url: string;
  size: number;
  lastModified: string;
}

export interface ListImagesResponse {
  images: ImageItem[];
  count: number;
  bucket: string;
}

/**
 * Obtiene una URL presignada para subir una imagen a S3
 */
export const getUploadUrl = async (fileName: string, fileType: string, fileSize: number): Promise<UploadImageResponse> => {
  return apiFetch<UploadImageResponse>("/admin/upload-image", {
    method: "POST",
    body: JSON.stringify({ fileName, fileType, fileSize }),
  });
};

/**
 * Sube un archivo a S3 usando la URL presignada
 */
export const uploadToS3 = async (file: File, uploadUrl: string): Promise<void> => {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type,
    },
  });

  if (!response.ok) {
    throw new Error(`Error al subir imagen: ${response.statusText}`);
  }
};

/**
 * Proceso completo: obtener URL presignada y subir archivo
 */
export const uploadImage = async (file: File): Promise<string> => {
  // 1. Obtener URL presignada
  const { uploadUrl, publicUrl } = await getUploadUrl(file.name, file.type, file.size);

  // 2. Subir archivo a S3
  await uploadToS3(file, uploadUrl);

  // 3. Retornar URL pública
  return publicUrl;
};

/**
 * Lista todas las imágenes del bucket
 */
export const listImages = async (prefix = "noticias/", limit = 100): Promise<ListImagesResponse> => {
  return apiFetch<ListImagesResponse>(`/admin/media?prefix=${encodeURIComponent(prefix)}&limit=${limit}`);
};

/**
 * Elimina una imagen del bucket
 */
export const deleteImage = async (key: string): Promise<void> => {
  await apiFetch<{ message: string }>("/admin/media", {
    method: "DELETE",
    body: JSON.stringify({ key }),
  });
};
