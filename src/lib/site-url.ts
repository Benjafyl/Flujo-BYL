import { getPublicEnv } from "@/lib/env";

const PRODUCTION_URL = "https://flujo-byl.vercel.app";
const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "::1"]);

function normalizeUrl(rawUrl: string) {
  const trimmed = rawUrl.trim();
  const withProtocol = trimmed.startsWith("http")
    ? trimmed
    : `https://${trimmed}`;
  const normalized = new URL(withProtocol);

  normalized.pathname = normalized.pathname.replace(/\/+$/, "");
  normalized.search = "";
  normalized.hash = "";

  return normalized.toString().replace(/\/$/, "");
}

function isLocalOrigin(origin: string) {
  return LOCAL_HOSTNAMES.has(new URL(origin).hostname);
}

export function resolveAppUrl(currentOrigin?: string) {
  const env = getPublicEnv();
  const fallbackUrl = normalizeUrl(env.NEXT_PUBLIC_SITE_URL ?? PRODUCTION_URL);

  if (!currentOrigin) {
    return fallbackUrl;
  }

  const normalizedOrigin = normalizeUrl(currentOrigin);
  return isLocalOrigin(normalizedOrigin) ? fallbackUrl : normalizedOrigin;
}

export function getAuthCallbackUrl(currentOrigin?: string) {
  return `${resolveAppUrl(currentOrigin)}/auth/callback`;
}
