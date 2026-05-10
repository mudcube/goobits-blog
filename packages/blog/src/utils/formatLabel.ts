/**
 * Presentation-only formatter for blog taxonomy labels.
 *
 * Input is a kebab-case (or already-spaced) tag/category label as it appears
 * in Markdown frontmatter. Output is a human-friendly display string.
 *
 * URLs and slug comparisons continue to use the raw slug form — this helper
 * exists strictly for UI rendering.
 *
 * Themes can layer their own overrides on top of the defaults:
 *
 *   formatLabel('colrd', { labelOverrides: { colrd: 'COLRD' } })
 *
 * User-supplied overrides take precedence over the engine defaults.
 */

export type FormatLabelOptions = {
	/** Full-label overrides keyed by slugified form (e.g. `html5` → `HTML5`). */
	labelOverrides?: Record<string, string>
	/** Per-word overrides applied after splitting kebab segments (e.g. `api` → `API`). */
	wordOverrides?: Record<string, string>
}

/** Defaults covering universally-correct casings for common web terms. */
const DEFAULT_LABEL_OVERRIDES: Record<string, string> = {
	diy: 'DIY',
	html5: 'HTML5',
	js1k: 'JS1K',
	webgl: 'WebGL',
	javascript: 'JavaScript',
	webaudio: 'WebAudio'
}

const DEFAULT_WORD_OVERRIDES: Record<string, string> = {
	api: 'API',
	ai: 'AI',
	ui: 'UI',
	ux: 'UX',
	css: 'CSS',
	html: 'HTML',
	svg: 'SVG',
	dom: 'DOM',
	js: 'JS',
	ts: 'TS',
	rss: 'RSS',
	'2d': '2D',
	'3d': '3D'
}

export function formatLabel(raw: string | null | undefined, options: FormatLabelOptions = {}): string {
	if (!raw) { return '' }

	const slug = raw.trim().toLowerCase().replace(/\s+/g, '-')
	if (!slug) { return '' }

	const labelOverrides = { ...DEFAULT_LABEL_OVERRIDES, ...options.labelOverrides }
	const wordOverrides = { ...DEFAULT_WORD_OVERRIDES, ...options.wordOverrides }

	const override = labelOverrides[slug]
	if (override) { return override }

	return slug
		.split('-')
		.filter(Boolean)
		.map(word => wordOverrides[word] ?? (word[0]?.toUpperCase() ?? '') + word.slice(1))
		.join(' ')
}
