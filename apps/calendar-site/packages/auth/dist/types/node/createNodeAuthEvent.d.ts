import type { IncomingMessage } from 'node:http';
import type { RequestEventLike } from '../types/auth.js';
import { NodeCookies } from './nodeCookies.js';
export declare function createNodeAuthEvent({ body, req }: {
    body?: Buffer;
    req: IncomingMessage;
}): Promise<{
    cookies: NodeCookies;
    event: RequestEventLike;
}>;
