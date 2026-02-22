export function isAdminMockMode(url: URL) {
	return url.searchParams.get('mock') === '1'
}

export function withAdminMock(path: string, mockMode: boolean) {
	if (!mockMode) return path
	if (/([?&])mock=1(?:&|$)/.test(path)) return path
	return `${path}${path.includes('?') ? '&' : '?'}mock=1`
}
