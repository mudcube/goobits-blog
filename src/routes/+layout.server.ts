import { dev } from '$app/environment'
import { getActiveReleaseStage } from '$lib/app/release'

const fixedThemePreferences = {
	theme: 'dark',
	themeScheme: 'default'
} as const

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
		preferences: locals['themePreferences'] ?? fixedThemePreferences,
		activeStage: getActiveReleaseStage({
			cookies,
			enablePreview: isLocalPreviewHost
		}),
		showVersionSwitcher: isLocalPreviewHost
	}
}
