/**
 * Mock-mode is a development-only affordance: it lets the admin UI render
 * fake catalog data without hitting the real database. It is NEVER active
 * in production, even if `?mock=1` is present in the URL — the dev gate
 * here ensures production builds tree-shake out the mock paths and never
 * misinterpret a stale URL flag as a request to display fabricated data.
 */
export function isAdminMockMode(url: URL): boolean {
	if (!import.meta.env.DEV) return false
	return url.searchParams.get('mock') === '1'
}

export function withAdminMock(path: string, mockMode: boolean): string {
	if (!mockMode) return path
	if (/([?&])mock=1(?:&|$)/.test(path)) return path
	return `${path}${path.includes('?') ? '&' : '?'}mock=1`
}
