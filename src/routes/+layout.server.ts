import { dev } from '$app/environment'
import { getActiveReleaseStage } from '$lib/release'

export function load({
	cookies,
	locals,
	url
}: {
	cookies: import('@sveltejs/kit').Cookies
	locals: Record<string, unknown>
	url: URL
}) {
	const isLocalPreviewHost =
		dev && ['localhost', '127.0.0.1'].includes(url.hostname)

	return {
		preferences: locals['themePreferences'],
		activeStage: getActiveReleaseStage({
			cookies,
			enablePreview: isLocalPreviewHost
		}),
		showVersionSwitcher: isLocalPreviewHost
	}
}
