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

/**
 * Pull the smallest WebP variant from a manifest entry's srcset. Useful as
 * a thumbnail `src` fallback in tight slots (e.g. 160px archive thumb) so
 * non-AVIF/non-WebP browsers don't fetch the multi-MB hero variant.
 */
export function getJournalImageThumbnailSrc(entry: JournalImageEntry | null): string {
	if (!entry) return ''
	const srcset = entry.webp?.srcset || entry.avif?.srcset
	if (srcset) {
		const candidates = srcset
			.split(',')
			.map((part) => {
				const [src, descriptor] = part.trim().split(/\s+/)
				const width = descriptor?.endsWith('w')
					? Number.parseInt(descriptor.slice(0, -1), 10)
					: Number.NaN
				return { src: src ?? '', width }
			})
			.filter((c) => c.src.length > 0 && Number.isFinite(c.width))
			.sort((a, b) => a.width - b.width)
		if (candidates.length > 0 && candidates[0]) {
			return candidates[0].src
		}
	}
	return entry.fallbackSrc
}
