const HEIC_MIME_TYPES = new Set(['image/heic', 'image/heif']);
const HEIC_EXTENSION = /\.hei[cf]$/i;

// Cheap sync pre-check so non-HEIC uploads (the common case) never pull in the heic-to
// chunk. Some browsers report an empty File.type for HEIC, so extension is checked too.
export function isHeic(file: File): boolean {
  return HEIC_MIME_TYPES.has(file.type) || HEIC_EXTENSION.test(file.name);
}

export async function convertHeicToJpeg(file: File): Promise<File> {
  const { heicTo } = await import('heic-to');
  const blob = await heicTo({ blob: file, type: 'image/jpeg', quality: 0.85 });
  return new File([blob], file.name.replace(HEIC_EXTENSION, '.jpg'), { type: 'image/jpeg' });
}
