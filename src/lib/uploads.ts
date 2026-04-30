import type { Attachment } from "@/store/types";

export const MAX_FILE_BYTES = 1.5 * 1024 * 1024; // 1.5MB per file (localStorage friendly)
export const MAX_TOTAL_BYTES = 4 * 1024 * 1024;  // 4MB across all attachments per record
export const AVATAR_MAX_DIM = 256;               // px — downscaled avatars

const uid = () => Math.random().toString(36).slice(2, 10);

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export async function fileToAttachment(file: File): Promise<Attachment> {
  if (file.size > MAX_FILE_BYTES) {
    throw new Error(`"${file.name}" is ${formatBytes(file.size)} — max ${formatBytes(MAX_FILE_BYTES)} per file.`);
  }
  const dataUrl = await readFileAsDataUrl(file);
  return { id: uid(), name: file.name, type: file.type || "application/octet-stream", size: file.size, dataUrl };
}

/** Downscale an image file to a square data URL (used for avatars + project covers). */
export async function readImageDownscaled(
  file: File,
  maxDim = 1280,
  quality = 0.82,
): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("File must be an image.");
  const rawUrl = await readFileAsDataUrl(file);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const ratio = Math.min(1, maxDim / Math.max(img.width, img.height));
      const w = Math.round(img.width * ratio);
      const h = Math.round(img.height * ratio);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas not supported"));
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => reject(new Error("Could not read image"));
    img.src = rawUrl;
  });
}

export function totalSize(atts: Attachment[] | undefined): number {
  return (atts ?? []).reduce((n, a) => n + a.size, 0);
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
