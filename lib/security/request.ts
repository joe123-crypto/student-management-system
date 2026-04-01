import { isIP } from 'net';

type HeaderCollection = Headers | Record<string, string | string[] | undefined>;
type TrustedProxyProvider = 'generic' | 'vercel' | 'cloudflare';

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

function isTruthyEnvFlag(value: string | undefined): boolean {
  const normalized = value?.trim().toLowerCase();
  return normalized === '1' || normalized === 'true' || normalized === 'yes' || normalized === 'on';
}

function getTrustedProxyProvider(): TrustedProxyProvider {
  const normalized = process.env.TRUST_PROXY_PROVIDER?.trim().toLowerCase();
  if (normalized === 'vercel' || normalized === 'cloudflare') {
    return normalized;
  }

  return 'generic';
}

function normalizeIpCandidate(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  const bracketedMatch = /^\[([^[\]]+)\](?::\d+)?$/.exec(trimmed);
  const candidate = bracketedMatch?.[1] || trimmed;
  const ipv4Mapped = candidate.startsWith('::ffff:') ? candidate.slice(7) : candidate;

  if (isIP(ipv4Mapped)) {
    return ipv4Mapped;
  }

  const lastColon = candidate.lastIndexOf(':');
  if (lastColon > 0) {
    const host = candidate.slice(0, lastColon);
    const port = candidate.slice(lastColon + 1);
    if (/^\d+$/.test(port) && isIP(host) === 4) {
      return host;
    }
  }

  return undefined;
}

function readForwardedFor(headers: HeaderCollection): string | undefined {
  const forwardedFor = readHeader(headers, 'x-forwarded-for');
  if (!forwardedFor) {
    return undefined;
  }

  const candidates = forwardedFor
    .split(',')
    .map((value) => normalizeIpCandidate(value))
    .filter((value): value is string => Boolean(value));

  return candidates[0];
}

export function getClientIp(headers: HeaderCollection): string | undefined {
  if (!isTruthyEnvFlag(process.env.TRUST_PROXY_HEADERS)) {
    return undefined;
  }

  const provider = getTrustedProxyProvider();
  const providerCandidates =
    provider === 'cloudflare'
      ? [
          readHeader(headers, 'cf-connecting-ip'),
          readForwardedFor(headers),
          readHeader(headers, 'x-real-ip'),
        ]
      : [
          readForwardedFor(headers),
          readHeader(headers, 'x-real-ip'),
        ];

  for (const candidate of providerCandidates) {
    if (!candidate) {
      continue;
    }

    const normalized = normalizeIpCandidate(candidate);
    if (normalized) {
      return normalized;
    }
  }

  return undefined;
}
