// src/login-context/cookie-context.ts
function buildCookieOptions(defaults, overrides) {
  return {
    httpOnly: true,
    secure: overrides?.secure ?? defaults?.secure ?? true,
    sameSite: overrides?.sameSite ?? defaults?.sameSite ?? "lax",
    path: overrides?.path ?? defaults?.path ?? "/",
    maxAge: overrides?.maxAge ?? defaults?.maxAge ?? 10 * 60
  };
}
function createCookieLoginContext(config) {
  const entries = Object.entries(config.cookies);
  function get(cookies) {
    return Object.fromEntries(
      entries.map(([key, cookieName]) => [key, cookies.get(cookieName) || null])
    );
  }
  function set(cookies, values, options) {
    const cookieOptions = buildCookieOptions(config.options, options);
    for (const [key, cookieName] of entries) {
      const value = values[key];
      if (value) {
        cookies.set(cookieName, value, cookieOptions);
      }
    }
  }
  function clear(cookies, keys) {
    const path = config.options?.path ?? "/";
    const selected = keys ? entries.filter(([key]) => keys.includes(key)) : entries;
    for (const [, cookieName] of selected) {
      cookies.delete(cookieName, { path });
    }
  }
  function take(cookies, keys) {
    const value = get(cookies);
    clear(cookies, keys);
    return value;
  }
  return { get, set, clear, take };
}

// src/utils/redirect.ts
function isSafeRedirectPath(value) {
  const v = value.trim();
  if (!v) return false;
  if (!v.startsWith("/")) return false;
  if (v.startsWith("//")) return false;
  if (v.includes("\\")) return false;
  if (/[\u0000-\u001f\u007f]/.test(v)) return false;
  return true;
}
var SAFE_REDIRECT_PARSE_BASE_URL = "http://localhost";
function normalizeSafeRedirectPath(value, options = {}) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!isSafeRedirectPath(trimmed)) return null;
  let parsed;
  try {
    parsed = new URL(trimmed, options.baseUrl ?? SAFE_REDIRECT_PARSE_BASE_URL);
  } catch {
    return null;
  }
  const pathname = parsed.pathname;
  const allowedPrefixes = options.allowedPrefixes ?? [];
  if (allowedPrefixes.length > 0) {
    const isAllowed = allowedPrefixes.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    );
    if (!isAllowed) return null;
  }
  return `${pathname}${parsed.search}${parsed.hash}`;
}

export { createCookieLoginContext, isSafeRedirectPath, normalizeSafeRedirectPath };
