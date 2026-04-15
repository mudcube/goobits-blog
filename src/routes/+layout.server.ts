import { dev } from '$app/environment'
import { getActiveReleaseStage } from '$lib/app/release'
import { getTarget } from '$lib/app/target'

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
	const activeTarget = getTarget(cookies)

	return {
		preferences: locals['themePreferences'] ?? fixedThemePreferences,
		activeStage: getActiveReleaseStage({
			cookies,
			enablePreview: isLocalPreviewHost
		}),
		activeTarget,
		showVersionSwitcher: isLocalPreviewHost
	}
}
