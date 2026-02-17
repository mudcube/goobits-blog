import { error, redirect } from "@sveltejs/kit";
import { createAuth } from "./createAuth.js";
function normalizeBasePath(input) {
    const raw = input ?? "/auth";
    const trimmed = raw.endsWith("/") && raw.length > 1 ? raw.slice(0, -1) : raw;
    return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}
function splitRoutedPath(pathname, basePath) {
    if (!pathname.startsWith(basePath))
        return [];
    const rest = pathname.slice(basePath.length);
    const normalized = rest.startsWith("/") ? rest.slice(1) : rest;
    if (!normalized)
        return [];
    return normalized.split("/").filter((part) => part.length > 0);
}
function hasSessionPrincipal(locals) {
    return !!locals.session && !!locals.user;
}
function resolveUserRoles(user) {
    const roles = [];
    if (typeof user.role === "string" && user.role.length > 0) {
        roles.push(user.role);
    }
    const settings = user.settings;
    if (settings && typeof settings === "object" && !Array.isArray(settings)) {
        const maybeRoles = settings["roles"];
        if (Array.isArray(maybeRoles)) {
            for (const entry of maybeRoles) {
                if (typeof entry === "string" && entry.length > 0) {
                    roles.push(entry);
                }
            }
        }
    }
    return Array.from(new Set(roles));
}
export class GoobitsAuth {
    core;
    routing;
    defaultHandlers;
    constructor(config) {
        const { routing, adapter, adapters, ...rest } = config;
        const resolvedAdapters = adapter ?? adapters;
        if (!resolvedAdapters) {
            throw new Error("GoobitsAuth requires 'adapter' (or legacy 'adapters') configuration");
        }
        const authConfig = {
            ...rest,
            adapters: resolvedAdapters,
        };
        this.core = createAuth(authConfig);
        const basePath = normalizeBasePath(routing?.basePath);
        this.routing = {
            basePath,
            signInPath: routing?.signInPath ?? `${basePath}/signin`,
            signOutPath: routing?.signOutPath ?? `${basePath}/signout`,
        };
        this.defaultHandlers = this.createHandlers();
    }
    get adapter() {
        return this.core.adapters;
    }
    get providers() {
        return this.core.providers;
    }
    get handlers() {
        return this.defaultHandlers;
    }
    handle() {
        return async ({ event, resolve }) => {
            const baseEvent = event;
            const response = await this.core.handlers.hooks({
                event: baseEvent,
                resolve: async (nextEvent) => {
                    const locals = nextEvent.locals;
                    locals.auth = hasSessionPrincipal(nextEvent.locals)
                        ? { session: nextEvent.locals.session, user: nextEvent.locals.user }
                        : null;
                    return resolve(nextEvent);
                },
            });
            const locals = event.locals;
            if (locals.auth === undefined) {
                locals.auth = hasSessionPrincipal(event.locals)
                    ? { session: event.locals.session, user: event.locals.user }
                    : null;
            }
            return response;
        };
    }
    createHandlers(options) {
        const basePath = normalizeBasePath(options?.basePath ?? this.routing.basePath);
        const dispatch = async (event) => {
            const method = event.request.method.toUpperCase();
            if (method !== "GET" && method !== "POST") {
                return new Response("Method Not Allowed", { status: 405 });
            }
            const segments = splitRoutedPath(event.url.pathname, basePath);
            const target = this.resolveTarget({
                event: event,
                segments,
                method,
            });
            if (!target) {
                return new Response("Not Found", { status: 404 });
            }
            if (target.method !== method) {
                return new Response("Method Not Allowed", { status: 405 });
            }
            return target.handler(event);
        };
        return {
            GET: dispatch,
            POST: dispatch,
        };
    }
    async getSession(event) {
        if (hasSessionPrincipal(event.locals)) {
            return {
                session: event.locals.session,
                user: event.locals.user,
            };
        }
        const sessionAdapter = this.core.adapters.session;
        const cookieName = sessionAdapter["cookieName"] ?? "session";
        const sessionId = event.cookies.get(cookieName);
        if (!sessionId) {
            return null;
        }
        const { session, user } = await sessionAdapter.validateSession(sessionId);
        event.locals.session = session;
        event.locals.user = user;
        const locals = event.locals;
        locals.auth = session && user ? { session, user } : null;
        return locals.auth;
    }
    async requireUser(event) {
        const principal = await this.getSession(event);
        if (!principal) {
            throw redirect(302, this.routing.signInPath);
        }
        return principal.user;
    }
    async requireRole(event, role, options) {
        const user = await this.requireUser(event);
        const roles = options?.resolveRoles ? options.resolveRoles(user) : resolveUserRoles(user);
        const required = Array.isArray(role) ? role : [role];
        const allowed = required.some((entry) => roles.includes(entry));
        if (!allowed) {
            const emitter = this.core.security.audit.emitter;
            await emitter?.({
                name: "authz.denied",
                severity: "warn",
                route: event.url.pathname,
                method: event.request.method,
                status: 403,
                message: "Missing required role",
                userId: user.id,
                details: {
                    requiredRoles: required,
                    actorRoles: roles,
                },
                timestamp: new Date().toISOString(),
            });
            throw error(403, "Forbidden");
        }
        return user;
    }
    resolveTarget(input) {
        const { event, segments, method } = input;
        const handlers = this.core.handlers;
        if (segments.length === 2 && segments[0] === "signin" && method === "GET") {
            const provider = segments[1];
            if (!provider || !handlers.login)
                return null;
            event.params["provider"] = provider;
            return { method: "GET", handler: handlers.login };
        }
        if (segments.length === 2 && segments[0] === "callback" && method === "GET") {
            const provider = segments[1];
            if (!provider || !handlers.callback)
                return null;
            event.params["provider"] = provider;
            return { method: "GET", handler: handlers.callback };
        }
        if (segments.length === 1 && (segments[0] === "signout" || segments[0] === "logout")) {
            return { method: "POST", handler: handlers.logout };
        }
        if (segments.length === 1 && segments[0] === "magic-link") {
            if (!handlers.magicLink)
                return null;
            return { method: "POST", handler: handlers.magicLink.request };
        }
        if (segments.length === 2 && segments[0] === "magic-link" && segments[1] === "verify") {
            if (!handlers.magicLink)
                return null;
            return { method, handler: handlers.magicLink.verify };
        }
        if (segments.length === 3 && segments[0] === "passkey" && segments[1] === "register") {
            if (!handlers.webauthn)
                return null;
            if (segments[2] === "options") {
                return { method: "POST", handler: handlers.webauthn.registerOptions };
            }
            if (segments[2] === "verify") {
                return { method: "POST", handler: handlers.webauthn.registerVerify };
            }
        }
        if (segments.length === 3 && segments[0] === "passkey" && segments[1] === "login") {
            if (!handlers.webauthn)
                return null;
            if (segments[2] === "options") {
                return { method: "POST", handler: handlers.webauthn.loginOptions };
            }
            if (segments[2] === "verify") {
                return { method: "POST", handler: handlers.webauthn.loginVerify };
            }
        }
        if (segments.length === 1 && segments[0] === "sessions") {
            if (!handlers.sessions)
                return null;
            return method === "GET"
                ? { method: "GET", handler: handlers.sessions.list }
                : { method: "POST", handler: handlers.sessions.revoke };
        }
        if (segments.length === 1 && handlers.login && method === "GET") {
            const provider = segments[0];
            if (!provider)
                return null;
            event.params["provider"] = provider;
            return { method: "GET", handler: handlers.login };
        }
        if (segments.length === 2 && handlers.callback && method === "GET" && segments[1] === "callback") {
            const provider = segments[0];
            if (!provider)
                return null;
            event.params["provider"] = provider;
            return { method: "GET", handler: handlers.callback };
        }
        return null;
    }
}
//# sourceMappingURL=goobits-auth.js.map