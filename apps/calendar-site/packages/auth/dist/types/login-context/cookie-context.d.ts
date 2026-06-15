import type { Cookies } from "@sveltejs/kit";
type CookiesLike = Pick<Cookies, "set" | "get" | "delete">;
type LoginContextCookieOptions = {
    secure?: boolean;
    maxAge?: number;
    sameSite?: "lax" | "strict" | "none";
    path?: string;
};
export type CookieLoginContextConfig<Key extends string> = {
    cookies: Record<Key, string>;
    options?: LoginContextCookieOptions;
};
export type CookieLoginContextRuntimeOptions = LoginContextCookieOptions;
export declare function createCookieLoginContext<const Key extends string>(config: CookieLoginContextConfig<Key>): {
    get: (cookies: Pick<CookiesLike, "get">) => Record<Key, string | null>;
    set: (cookies: Pick<CookiesLike, "set">, values: Partial<Record<Key, string | null | undefined>>, options?: CookieLoginContextRuntimeOptions) => void;
    clear: (cookies: Pick<CookiesLike, "delete">, keys?: readonly Key[]) => void;
    take: (cookies: Pick<CookiesLike, "get" | "delete">, keys?: readonly Key[]) => Record<Key, string | null>;
};
export {};
