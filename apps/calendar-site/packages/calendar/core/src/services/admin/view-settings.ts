import type { D1DatabaseLike } from '../../storage/d1.ts'
import { getAdminPreferences, setAdminPreference } from './preferences.ts'

export type WeekStart = 'sunday' | 'monday'

export type AdminViewSettings = {
	weekStart: WeekStart
}

const DEFAULT_VIEW_SETTINGS: AdminViewSettings = {
	weekStart: 'monday'
}

const KEY_WEEK_START = 'view.weekStart'

function parseWeekStart(value: string | null): WeekStart {
	return value === 'sunday' ? 'sunday' : 'monday'
}

export async function getAdminViewSettings(
	db: D1DatabaseLike,
	userId: number
): Promise<AdminViewSettings> {
	const prefs = await getAdminPreferences(db, userId, [KEY_WEEK_START])
	return {
		weekStart: parseWeekStart(prefs[KEY_WEEK_START] ?? null)
	}
}

export async function setAdminViewSettings(
	db: D1DatabaseLike,
	userId: number,
	patch: Partial<AdminViewSettings>
): Promise<AdminViewSettings> {
	if (patch.weekStart !== undefined) {
		await setAdminPreference(db, userId, KEY_WEEK_START, parseWeekStart(patch.weekStart))
	}
	return getAdminViewSettings(db, userId)
}

export function getDefaultAdminViewSettings(): AdminViewSettings {
	return { ...DEFAULT_VIEW_SETTINGS }
}
