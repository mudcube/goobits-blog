import type { IncomingMessage, ServerResponse } from 'node:http';
type CookieOptions = {
    domain?: string;
    expires?: Date;
    httpOnly?: boolean;
    maxAge?: number;
    path?: string;
    sameSite?: 'strict' | 'lax' | 'none' | boolean;
    secure?: boolean;
};
export declare class NodeCookies {
    #private;
    constructor(req: IncomingMessage);
    get(name: string): string | undefined;
    getAll(name?: string): Array<{
        name: string;
        value: string;
    }>;
    serialize(name: string, value: string, options?: CookieOptions): string;
    set(name: string, value: string, options?: CookieOptions): void;
    delete(name: string, options?: CookieOptions): void;
    writeTo(res: ServerResponse): void;
}
export {};
