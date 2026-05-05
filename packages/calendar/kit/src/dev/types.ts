export type D1PreparedStatement = {
	bind: (...args: unknown[]) => D1PreparedStatement
	first: <T = Record<string, unknown>>() => Promise<T | null>
	all: <T = Record<string, unknown>>() => Promise<{ results?: T[] }>
	run: () => Promise<{ meta: { last_row_id: number; changes: number } }>
}

export type D1DatabaseLike = {
	prepare(query: string): D1PreparedStatement
}

export type R2PutOptions = {
	httpMetadata?: { contentType?: string; cacheControl?: string }
	customMetadata?: Record<string, string>
}

export type R2BucketLike = {
	put(
		key: string,
		value: ArrayBuffer | ArrayBufferView | ReadableStream | string,
		options?: R2PutOptions
	): Promise<unknown>
	delete(key: string): Promise<void>
}

