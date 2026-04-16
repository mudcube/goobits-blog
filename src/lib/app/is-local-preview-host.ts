export function isLocalPreviewHost(hostname: string) {
	return hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.local')
}
