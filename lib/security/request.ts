type HeaderCollection = Headers | Record<string, string | string[] | undefined>;

function readHeader(headers: HeaderCollection, name: string): string | undefined {
  if (headers instanceof Headers) {
    return headers.get(name) ?? undefined;
  }

  const direct = headers[name];
  if (typeof direct === 'string') {
    return direct;
  }

  if (Array.isArray(direct)) {
    return direct[0];
  }

  const lowerKey = Object.keys(headers).find((key) => key.toLowerCase() === name.toLowerCase());
  if (!lowerKey) {
    return undefined;
  }

  const lowerValue = headers[lowerKey];
  if (typeof lowerValue === 'string') {
    return lowerValue;
  }

  return Array.isArray(lowerValue) ? lowerValue[0] : undefined;
}

export function getClientIp(headers: HeaderCollection): string | undefined {
  const forwardedFor = readHeader(headers, 'x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || undefined;
  }

  return readHeader(headers, 'x-real-ip')?.trim() || undefined;
}
