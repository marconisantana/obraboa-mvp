export async function compressImage(
  file: File,
  maxWidth = 1200,
  quality = 0.8
): Promise<File> {
  // Skip non-image files
  if (!file.type.startsWith('image/')) return file;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // Skip if already small enough
      if (img.width <= maxWidth) {
        resolve(file);
        return;
      }

      const ratio = maxWidth / img.width;
      const canvas = document.createElement('canvas');
      canvas.width = maxWidth;
      canvas.height = Math.round(img.height * ratio);

      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(file); return; }

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          if (!blob) { resolve(file); return; }
          const compressed = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          resolve(compressed);
        },
        'image/jpeg',
        quality
      );
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}
