import type { ServerResponse } from 'node:http';
import type { NodeCookies } from './nodeCookies.js';
export declare function sendFetchResponse(res: ServerResponse, response: Response, cookies?: NodeCookies): Promise<void>;
