import { dev } from '$app/environment'

export function getTurnstileSiteKey(env: Record<string, string | undefined>) {
	const localWidgetEnabled = env['TURNSTILE_ENABLE_LOCALHOST'] === 'true'
	return dev && !localWidgetEnabled ? '' : env['PUBLIC_TURNSTILE_SITE_KEY'] || ''
}
