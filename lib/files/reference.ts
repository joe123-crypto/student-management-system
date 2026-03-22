export function buildFileContentPath(fileId: string): string {
  return `/api/files/${encodeURIComponent(fileId)}/content`;
}

export function buildFileUploadPath(fileId: string): string {
  return `/api/files/${encodeURIComponent(fileId)}/upload`;
}

export function extractFileIdFromReference(value: string | null | undefined): string | null {
  const normalized = value?.trim();
  if (!normalized) {
    return null;
  }

  const routeMatch = /^\/api\/files\/([^/]+)\/content(?:[/?#]|$)/.exec(normalized);
  if (routeMatch?.[1]) {
    return decodeURIComponent(routeMatch[1]);
  }

  if (/^[A-Za-z0-9_-]+$/.test(normalized)) {
    return normalized;
  }

  return null;
}
