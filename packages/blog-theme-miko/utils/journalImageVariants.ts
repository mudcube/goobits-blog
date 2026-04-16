import { journalImageManifest } from './generated/journal-image-manifest'

type JournalImageVariant = {
	type: string
	srcset: string
	defaultSrc: string
}

type JournalImageEntry = {
	width: number
	height: number
	sizes: string
	avif?: JournalImageVariant
	webp?: JournalImageVariant
	fallbackSrc: string
}

export function getJournalImageVariants(sourcePath: string): JournalImageEntry | null {
	if (!sourcePath) return null
	// Source paths are journal-frontmatter or page-level public asset paths.
	return (journalImageManifest as Record<string, JournalImageEntry>)[sourcePath] ?? null
}
