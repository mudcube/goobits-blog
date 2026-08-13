/**
 * Svelte action that upgrades runs of image-only paragraphs within a prose
 * container into interactive gallery tiles.
 *
 * Pattern detected (per paragraph):
 *   <p><a href="..."><img src="..." alt="..." /></a></p>
 *   <p><img src="..." alt="..." /></p>
 *
 * Consecutive qualifying <p> elements are grouped into "sets" (a run ends
 * when a non-image paragraph or other element breaks the sequence).
 *
 * On click of any qualifying image the action dispatches a
 * `gallery:open` CustomEvent that bubbles up from the host element so a
 * single BlogLightbox instance elsewhere in the DOM can receive it.
 *
 * The action returns a destroy handler that removes all listeners.
 *
 * Works without JS — the base :has() CSS grid in BlogProse still renders
 * the tiles correctly and clicks fall back to opening the full-res image
 * in a new tab via default anchor behavior.
 */

export type GalleryItem = {
	/** Full-resolution href — from the wrapping <a> if present, else the img.src */
	href: string
	/** Thumbnail src used in the tile (img.src) */
	src: string
	/** Alt text used as the lightbox caption */
	alt: string
}

export type GalleryOpenDetail = {
	items: GalleryItem[]
	index: number
}

type CleanupFn = () => void
type GallerySetEntry = { items: GalleryItem[]; index: number }

/**
 * Attach the gallery + lightbox behavior to a prose container.
 * Marks qualifying image paragraphs with a data attribute so the CSS
 * grid can target them consistently across browsers that support :has()
 * and as a hook for the click listener.
 */
export function galleryLightbox(node: HTMLElement): { destroy: () => void } {
	const cleanups: CleanupFn[] = []

	function isImageOnlyParagraph(el: Element): el is HTMLParagraphElement {
		if (el.tagName !== 'P') { return false }
		const children = Array.from(el.childNodes).filter(n => {
			if (n.nodeType === Node.TEXT_NODE) {
				return (n.textContent || '').trim().length > 0
			}
			return n.nodeType === Node.ELEMENT_NODE
		})
		if (children.length !== 1) { return false }
		const only = children[0] as Element
		if (only.tagName === 'IMG') { return true }
		if (only.tagName === 'A') {
			const anchorChildren = Array.from(only.childNodes).filter(n => {
				if (n.nodeType === Node.TEXT_NODE) {
					return (n.textContent || '').trim().length > 0
				}
				return n.nodeType === Node.ELEMENT_NODE
			})
			return anchorChildren.length === 1 && (anchorChildren[0] as Element).tagName === 'IMG'
		}
		return false
	}

	function extractItem(paragraph: HTMLParagraphElement): GalleryItem | null {
		const img = paragraph.querySelector('img')
		if (!img) { return null }
		const anchor = img.closest('a')
		const href = anchor?.getAttribute('href') || img.getAttribute('src') || ''
		const src = img.getAttribute('src') || ''
		const alt = img.getAttribute('alt') || ''
		if (!src) { return null }
		return { href, src, alt }
	}

	function collectSets(): Map<HTMLParagraphElement, GallerySetEntry> {
		const sets = new Map<HTMLParagraphElement, GallerySetEntry>()
		const paragraphs = Array.from(node.querySelectorAll<HTMLParagraphElement>(':scope > p'))

		let currentSet: HTMLParagraphElement[] = []
		const allSets: HTMLParagraphElement[][] = []

		for (const p of paragraphs) {
			if (isImageOnlyParagraph(p)) {
				currentSet.push(p)
			} else if (currentSet.length > 0) {
				allSets.push(currentSet)
				currentSet = []
			}
		}
		if (currentSet.length > 0) {
			allSets.push(currentSet)
		}

		for (const set of allSets) {
			const items = set
				.map(extractItem)
				.filter((item): item is GalleryItem => item !== null)
			set.forEach((p, index) => {
				sets.set(p, { items, index })
				p.setAttribute('data-blog-gallery-tile', '')
				if (set.length > 1) {
					p.setAttribute('data-blog-gallery-set', String(allSets.indexOf(set)))
				}
			})
		}
		return sets
	}

	const sets = collectSets()

	function handleClick(event: Event): void {
		const target = event.target as Element | null
		if (!target) { return }
		const paragraph = target.closest<HTMLParagraphElement>('p[data-blog-gallery-tile]')
		if (!paragraph) { return }
		const entry = sets.get(paragraph)
		if (!entry || entry.items.length === 0) { return }

		event.preventDefault()
		event.stopPropagation()

		const detail: GalleryOpenDetail = {
			items: entry.items,
			index: entry.index
		}
		node.dispatchEvent(
			new CustomEvent<GalleryOpenDetail>('gallery:open', {
				detail,
				bubbles: true,
				composed: true
			})
		)
	}

	node.addEventListener('click', handleClick)
	cleanups.push(() => {
		node.removeEventListener('click', handleClick)
	})

	// Set cursor affordance on tiles so users know they're clickable
	for (const paragraph of sets.keys()) {
		paragraph.classList.add('blog-gallery__tile')
	}

	return {
		destroy(): void {
			for (const fn of cleanups) { fn() }
			for (const paragraph of sets.keys()) {
				paragraph.removeAttribute('data-blog-gallery-tile')
				paragraph.removeAttribute('data-blog-gallery-set')
				paragraph.classList.remove('blog-gallery__tile')
			}
		}
	}
}
