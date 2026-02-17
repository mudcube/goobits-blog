import type { D1DatabaseLike } from './types'
export type { D1DatabaseLike, D1PreparedStatement } from './types'

let cachedDevDb: D1DatabaseLike | undefined

export async function getDevDb(): Promise<D1DatabaseLike> {
	if (cachedDevDb) return cachedDevDb
	const { createSqliteDb } = await import('./sqliteDb')
	cachedDevDb = createSqliteDb()
	return cachedDevDb
}
