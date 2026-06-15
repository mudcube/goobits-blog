import path from 'node:path'
import { fileURLToPath } from 'node:url'

function packageMigrationsDir() {
	return fileURLToPath(new URL('../sql', import.meta.url))
}

export function resolveCalendarMigrationsDir(cwd = process.cwd()) {
	const fromEnv = (process.env['CALENDAR_MIGRATIONS_DIR'] || '').trim()
	if (fromEnv) {
		return path.isAbsolute(fromEnv) ? fromEnv : path.join(cwd, fromEnv)
	}
	return packageMigrationsDir()
}
