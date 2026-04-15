/**
 * Presentation-only formatter for blog taxonomy labels.
 *
 * Input is a kebab-case (or already-spaced) tag/category label as it appears
 * in Markdown frontmatter. Output is a human-friendly display string.
 *
 * URLs and slug comparisons continue to use the raw slug form — this helper
 * exists strictly for UI rendering.
 */

/** Full-label overrides keyed by slugified form. */
const LABEL_OVERRIDES: Record<string, string> = {
	// Acronyms & initialisms
	diy: 'DIY',
	html5: 'HTML5',
	js1k: 'JS1K',
	webgl: 'WebGL',

	// Brand / canonical wordmarks
	colrd: 'COLRD',
	javascript: 'JavaScript',
	webaudio: 'WebAudio'
}

/** Per-word overrides applied after splitting kebab segments. */
const WORD_OVERRIDES: Record<string, string> = {
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

export function formatLabel(raw: string | null | undefined): string {
	if (!raw) { return '' }

	const slug = raw.trim().toLowerCase().replace(/\s+/g, '-')
	if (!slug) { return '' }

	const override = LABEL_OVERRIDES[slug]
	if (override) { return override }

	return slug
		.split('-')
		.filter(Boolean)
		.map(word => WORD_OVERRIDES[word] ?? (word[0]?.toUpperCase() ?? '') + word.slice(1))
		.join(' ')
}
