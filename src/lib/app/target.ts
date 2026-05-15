import type { Cookies } from '@sveltejs/kit'
import { TARGET_COOKIE, normalizeTarget, type Target } from '@goobits/visibility-mode'

export {
	DEFAULT_TARGET,
	TARGET_COOKIE,
	normalizeTarget,
	type Target
} from '@goobits/visibility-mode'

/**
 * Pre-rename cookie for this site. Read it as a fallback so existing visitors
 * keep their toggle state across the rename. New writes go to TARGET_COOKIE.
 */
export const LEGACY_TARGET_COOKIE = 'site-dev-surface'

export function getTarget(cookies?: Cookies): Target {
	return normalizeTarget(cookies?.get(TARGET_COOKIE) ?? cookies?.get(LEGACY_TARGET_COOKIE))
}
