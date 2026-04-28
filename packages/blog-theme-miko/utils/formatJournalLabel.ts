/**
 * Miko-specific journal label formatting.
 *
 * Maps certain kebab-case category/tag slugs to their preferred display form,
 * then falls back to generic title-casing.
 */

const JOURNAL_LABEL_MAP: Record<string, string> = {
	apps: 'Apps',
	'code-art': 'Code Art',
	colrd: 'Colrd',
	diy: 'DIY'
}

export function formatJournalLabel(value: string) {
	const normalized = value.trim().toLowerCase()
	if (!normalized) return ''
	if (JOURNAL_LABEL_MAP[normalized]) return JOURNAL_LABEL_MAP[normalized]

	return normalized
		.split('-')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ')
}
