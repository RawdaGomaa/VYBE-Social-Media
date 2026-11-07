/**
 * Profile photos do not need full screenshot/camera resolution.
 * Downscaling before upload makes the Route Posts upload endpoint much more
 * reliable on slower connections while keeping more than enough quality for avatars.
 */
export async function prepareProfilePhoto(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image file");
  }

  // GIFs should not be rasterized because that would destroy animation.
  if (file.type === "image/gif") return file;

  const bitmap = await createImageBitmap(file);
  try {
    const maxSide = 1080;
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    // If it is already reasonably small, keep the original bytes/format.
    if (scale === 1 && file.size <= 1_500_000) return file;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    // White background avoids black transparency when converting PNG to JPEG.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", 0.84);
    });
    if (!blob) return file;

    const baseName = file.name.replace(/\.[^.]+$/, "") || "profile-photo";
    return new File([blob], `${baseName}.jpg`, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  } finally {
    bitmap.close();
  }
}
