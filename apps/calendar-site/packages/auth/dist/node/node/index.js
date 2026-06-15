import { Buffer } from 'buffer';

// src/node/nodeCookies.ts
var NodeCookies = class {
  #cookies;
  #setCookieHeaders = [];
  constructor(req) {
    this.#cookies = parseCookieHeader(req.headers.cookie);
  }
  get(name) {
    return this.#cookies.get(name);
  }
  getAll(name) {
    return [...this.#cookies.entries()].filter(([cookieName]) => !name || cookieName === name).map(([cookieName, value]) => ({
      name: cookieName,
      value
    }));
  }
  serialize(name, value, options = {}) {
    return serializeCookie(name, value, options);
  }
  set(name, value, options = {}) {
    this.#cookies.set(name, value);
    this.#setCookieHeaders.push(serializeCookie(name, value, options));
  }
  delete(name, options = {}) {
    this.#cookies.delete(name);
    this.#setCookieHeaders.push(
      serializeCookie(name, "", {
        ...options,
        expires: /* @__PURE__ */ new Date(0),
        maxAge: 0
      })
    );
  }
  writeTo(res) {
    if (this.#setCookieHeaders.length) {
      res.setHeader("set-cookie", this.#setCookieHeaders);
    }
  }
};
function parseCookieHeader(header) {
  const cookies = /* @__PURE__ */ new Map();
  if (!header) {
    return cookies;
  }
  for (const part of header.split(";")) {
    const [rawName, ...rest] = part.trim().split("=");
    if (!rawName || !rest.length) {
      continue;
    }
    cookies.set(rawName, decodeURIComponent(rest.join("=")));
  }
  return cookies;
}
function serializeCookie(name, value, options) {
  const parts = [`${name}=${encodeURIComponent(value)}`];
  if (options.maxAge !== void 0) {
    parts.push(`Max-Age=${Math.trunc(options.maxAge)}`);
  }
  if (options.expires) {
    parts.push(`Expires=${options.expires.toUTCString()}`);
  }
  if (options.path) {
    parts.push(`Path=${options.path}`);
  }
  if (options.domain) {
    parts.push(`Domain=${options.domain}`);
  }
  if (options.httpOnly) {
    parts.push("HttpOnly");
  }
  if (options.secure) {
    parts.push("Secure");
  }
  if (options.sameSite) {
    parts.push(`SameSite=${options.sameSite === true ? "Strict" : capitalize(options.sameSite)}`);
  }
  return parts.join("; ");
}
function capitalize(value) {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

// src/node/createNodeAuthEvent.ts
async function createNodeAuthEvent({
  body,
  req
}) {
  const url = new URL(req.url || "/", `http://${req.headers.host || "127.0.0.1"}`);
  const method = req.method || "GET";
  const headers = new Headers();
  for (const [name, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) {
      for (const entry of value) {
        headers.append(name, entry);
      }
    } else if (value !== void 0) {
      headers.set(name, value);
    }
  }
  const requestInit = {
    headers,
    method
  };
  if (method !== "GET" && method !== "HEAD") {
    requestInit.body = body;
  }
  const request = new Request(url, requestInit);
  const cookies = new NodeCookies(req);
  return {
    cookies,
    event: {
      cookies,
      getClientAddress: () => req.socket.remoteAddress || "127.0.0.1",
      locals: {},
      params: {},
      request,
      url
    }
  };
}
async function readRequestBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}
async function sendFetchResponse(res, response, cookies) {
  for (const [name, value] of response.headers) {
    if (name.toLowerCase() !== "set-cookie") {
      res.setHeader(name, value);
    }
  }
  cookies?.writeTo(res);
  const body = Buffer.from(await response.arrayBuffer());
  if (!res.hasHeader("content-length")) {
    res.setHeader("content-length", body.length);
  }
  res.writeHead(response.status);
  res.end(body);
}

export { NodeCookies, createNodeAuthEvent, readRequestBody, sendFetchResponse };
