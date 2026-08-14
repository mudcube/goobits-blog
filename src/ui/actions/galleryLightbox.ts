/**
 * Svelte action that upgrades runs of image-only paragraphs within a prose
 * container into interactive gallery tiles.
 *
 * Pattern detected (per paragraph):
 *   <p><a href="..."><img src="..." alt="..." /></a></p>
 *   <p><img src="..." alt="..." /></p>
 *
 * Consecutive qualifying <p> elements are grouped into "sets" (any other
 * direct child ends the run).
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
type AttributeState = Record<'aria-label' | 'role' | 'tabindex', string | null>

/**
 * Attach the gallery + lightbox behavior to a prose container.
 * Marks qualifying image paragraphs with a data attribute so the CSS
 * grid can target them consistently across browsers that support :has()
 * and as a hook for the click listener.
 */
export function galleryLightbox(node: HTMLElement): { destroy: () => void } {
	const cleanups: CleanupFn[] = []
	const accessibilityState = new Map<HTMLParagraphElement, AttributeState>()

	function isImageContent(element: Element): boolean {
		if (element.tagName === 'IMG') { return true }
		if (element.tagName !== 'PICTURE') { return false }

		const children = Array.from(element.children)
		return children.filter(child => child.tagName === 'IMG').length === 1
			&& children.every(child => child.tagName === 'SOURCE' || child.tagName === 'IMG')
	}

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
		if (isImageContent(only)) { return true }
		if (only.tagName === 'A') {
			const anchorChildren = Array.from(only.childNodes).filter(n => {
				if (n.nodeType === Node.TEXT_NODE) {
					return (n.textContent || '').trim().length > 0
				}
				return n.nodeType === Node.ELEMENT_NODE
			})
			return anchorChildren.length === 1 && isImageContent(anchorChildren[0] as Element)
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
		let currentSet: HTMLParagraphElement[] = []
		const allSets: HTMLParagraphElement[][] = []

		for (const child of Array.from(node.children)) {
			if (isImageOnlyParagraph(child)) {
				currentSet.push(child)
			} else if (currentSet.length > 0) {
				allSets.push(currentSet)
				currentSet = []
			}
		}
		if (currentSet.length > 0) {
			allSets.push(currentSet)
		}

		allSets.forEach((set, setIndex) => {
			const items = set
				.map(extractItem)
				.filter((item): item is GalleryItem => item !== null)
			set.forEach((p, index) => {
				sets.set(p, { items, index })
				p.setAttribute('data-blog-gallery-tile', '')
				if (set.length > 1) {
					p.setAttribute('data-blog-gallery-set', String(setIndex))
				}
				if (!p.querySelector('a')) {
					accessibilityState.set(p, {
						'aria-label': p.getAttribute('aria-label'),
						'role': p.getAttribute('role'),
						'tabindex': p.getAttribute('tabindex')
					})
					p.setAttribute('role', 'button')
					p.setAttribute('tabindex', '0')
					p.setAttribute('aria-label', items[index]?.alt
						? `Open image: ${ items[index].alt }`
						: 'Open image')
				}
			})
		})
		return sets
	}

	const sets = collectSets()

	function openParagraph(paragraph: HTMLParagraphElement, event: Event): void {
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

	function handleClick(event: Event): void {
		const target = event.target as Element | null
		const paragraph = target?.closest<HTMLParagraphElement>('p[data-blog-gallery-tile]')
		if (paragraph) {
			openParagraph(paragraph, event)
		}
	}

	function handleKeydown(event: KeyboardEvent): void {
		if (event.key !== 'Enter' && event.key !== ' ') { return }
		const target = event.target as Element | null
		const paragraph = target?.closest<HTMLParagraphElement>('p[data-blog-gallery-tile][role="button"]')
		if (paragraph && target === paragraph) {
			openParagraph(paragraph, event)
		}
	}

	node.addEventListener('click', handleClick)
	node.addEventListener('keydown', handleKeydown)
	cleanups.push(() => {
		node.removeEventListener('click', handleClick)
		node.removeEventListener('keydown', handleKeydown)
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
				const previous = accessibilityState.get(paragraph)
				if (previous) {
					for (const [ attribute, value ] of Object.entries(previous)) {
						if (value === null) {
							paragraph.removeAttribute(attribute)
						} else {
							paragraph.setAttribute(attribute, value)
						}
					}
				}
			}
		}
	}
}
