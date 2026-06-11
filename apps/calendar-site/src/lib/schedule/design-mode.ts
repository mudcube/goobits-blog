export const SCHEDULE_DESIGN_MODE_PARAM = 'mock'
export const SCHEDULE_DESIGN_MODE_VALUE = '1'

export function isScheduleDesignMode(url: URL): boolean {
	return url.searchParams.get(SCHEDULE_DESIGN_MODE_PARAM) === SCHEDULE_DESIGN_MODE_VALUE
}

export function withScheduleDesignMode(path: string, enabled: boolean): string {
	if (!enabled) return path
	if (/([?&])mock=1(?:&|$)/.test(path)) return path
	return `${path}${path.includes('?') ? '&' : '?'}mock=1`
}
