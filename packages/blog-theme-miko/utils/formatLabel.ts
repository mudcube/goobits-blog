/**
 * Miko's taxonomy label formatter.
 *
 * Delegates to the engine's generic `formatLabel` and layers on overrides
 * for Miko-specific project names that the engine wouldn't know about.
 */

import { formatLabel as formatLabelBase } from '@goobits/blog/core'

const MIKO_LABEL_OVERRIDES: Record<string, string> = {
	colrd: 'COLRD'
}

export function formatLabel(raw: string | null | undefined): string {
	return formatLabelBase(raw, { labelOverrides: MIKO_LABEL_OVERRIDES })
}
