import { z } from "zod";
export async function parseRequestData(request) {
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
        const data = await request.json().catch(() => ({}));
        if (!data || typeof data !== "object")
            return {};
        return data;
    }
    if (contentType.includes("application/x-www-form-urlencoded") ||
        contentType.includes("multipart/form-data")) {
        const form = await request.formData();
        return Object.fromEntries(form.entries());
    }
    return {};
}
export async function parseRequestDataWithSchema(request, schema) {
    const data = await parseRequestData(request);
    const parsed = schema.safeParse(data);
    if (!parsed.success)
        return null;
    return parsed.data;
}
export function jsonResponse(payload, status = 200) {
    return new Response(JSON.stringify(payload), {
        status,
        headers: { "content-type": "application/json" },
    });
}
//# sourceMappingURL=http.js.map