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
 *
 * TODO(2026-Q4): Safe to drop once anyone who held a `site-dev-surface` cookie
 * has either re-visited (rewriting under the new name) or aged out the cookie
 * (Max-Age was 1 year). Only the dev/preview audience uses this in practice,
 * so the migration window is short.
 */
export const LEGACY_TARGET_COOKIE = 'site-dev-surface'

export function getTarget(cookies?: Cookies): Target {
	return normalizeTarget(cookies?.get(TARGET_COOKIE) ?? cookies?.get(LEGACY_TARGET_COOKIE))
}
