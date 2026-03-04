export async function fileToWebpDataUrl(file: File, opts?: { maxWidth?: number; quality?: number }) {
  const maxWidth = opts?.maxWidth ?? 1600;
  const quality = opts?.quality ?? 0.82;

  const img = document.createElement("img");
  img.decoding = "async";

  const objectUrl = URL.createObjectURL(file);
  img.src = objectUrl;

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Failed to load image"));
  });

  const scale = Math.min(1, maxWidth / img.width);
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No 2D context");

  ctx.drawImage(img, 0, 0, w, h);

  URL.revokeObjectURL(objectUrl);

  const dataUrl = canvas.toDataURL("image/webp", quality);
  return dataUrl;
}