import { Buffer } from 'node:buffer';
export declare function readRequestBody(req: AsyncIterable<Buffer | Uint8Array | string>): Promise<Buffer>;
