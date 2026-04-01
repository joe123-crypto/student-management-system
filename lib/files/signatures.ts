function matchesSignature(bytes: Uint8Array, signature: number[], offset = 0): boolean {
  if (bytes.length < offset + signature.length) {
    return false;
  }

  for (let index = 0; index < signature.length; index += 1) {
    if (bytes[offset + index] !== signature[index]) {
      return false;
    }
  }

  return true;
}

export function sniffMimeTypeFromFileSignature(bytes: Uint8Array): string | null {
  if (matchesSignature(bytes, [0x25, 0x50, 0x44, 0x46, 0x2d])) {
    return 'application/pdf';
  }

  if (matchesSignature(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return 'image/png';
  }

  if (matchesSignature(bytes, [0xff, 0xd8, 0xff])) {
    return 'image/jpeg';
  }

  if (
    matchesSignature(bytes, [0x52, 0x49, 0x46, 0x46]) &&
    matchesSignature(bytes, [0x57, 0x45, 0x42, 0x50], 8)
  ) {
    return 'image/webp';
  }

  return null;
}
