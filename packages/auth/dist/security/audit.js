import { redactObject, DEFAULT_REDACT_KEYS } from "../utils/redact.js";
export function auditLog(event, options = {}) {
    const { logger = console, redactKeys = DEFAULT_REDACT_KEYS } = options;
    const safeEvent = redactObject(event, redactKeys);
    logger.info("audit", safeEvent);
}
export function withAuditLogging({ action = "unknown_action", includeRequestBody = false, includeResponse = false, logger = console, redactKeys = DEFAULT_REDACT_KEYS, } = {}) {
    return (handler) => {
        return async (event) => {
            const start = Date.now();
            const { request } = event;
            const locals = event.locals;
            const auditContext = {
                action,
                timestamp: new Date().toISOString(),
                method: request.method,
                url: request.url,
                clientIP: locals["clientIP"] || "unknown",
                userAgent: request.headers.get("user-agent") || "unknown",
                sessionId: locals["sessionId"] || null,
            };
            if (includeRequestBody && request.method !== "GET") {
                try {
                    auditContext["requestBody"] = await request.clone().json();
                }
                catch (error) {
                    auditContext["requestBodyError"] =
                        error instanceof Error ? error.message : String(error);
                }
            }
            auditLog(auditContext, { logger, redactKeys });
            try {
                const response = await handler(event);
                const duration = Date.now() - start;
                const result = {
                    ...auditContext,
                    status: response?.status || 200,
                    duration,
                    success: true,
                };
                if (includeResponse) {
                    try {
                        const responseBody = await response.clone().json();
                        result["responseBody"] = responseBody;
                    }
                    catch (error) {
                        result["responseBodyError"] =
                            error instanceof Error ? error.message : String(error);
                    }
                }
                auditLog(result, { logger, redactKeys });
                return response;
            }
            catch (error) {
                const duration = Date.now() - start;
                auditLog({
                    ...auditContext,
                    error: error instanceof Error ? error.message : String(error),
                    stack: error instanceof Error ? error.stack : undefined,
                    duration,
                    success: false,
                }, { logger, redactKeys });
                throw error;
            }
        };
    };
}
export function auditAuthEvent(event, payload = {}, options = {}) {
    auditLog({
        category: "auth",
        event,
        timestamp: new Date().toISOString(),
        ...payload,
    }, options);
}
//# sourceMappingURL=audit.js.map