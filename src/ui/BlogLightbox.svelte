<script lang="ts">
	import ChevronLeft from '@lucide/svelte/icons/chevron-left'
	import ChevronRight from '@lucide/svelte/icons/chevron-right'
	import X from '@lucide/svelte/icons/x'
	import { onMount } from 'svelte'
	import { createBlogUiMessages, type BlogUiMessagesInput } from '../config/blogMessages.js'
	import type { GalleryItem, GalleryOpenDetail } from './actions/galleryLightbox.js'

	type BlogLightboxProps = {
		/** Show the image caption (alt text) below the full-size image */
		showCaption?: boolean
		messages?: BlogUiMessagesInput
	}

	const { showCaption = true, messages: messageInput = {} }: BlogLightboxProps = $props()
	const messages = $derived(createBlogUiMessages(messageInput))

	let dialog: HTMLDialogElement
	let items = $state<GalleryItem[]>([])
	let index = $state(0)
	let touchStartX = $state<number | null>(null)
	let isVisible = $state(false)
	let isClosing = false
	let closeTimer: ReturnType<typeof setTimeout> | null = null
	let revealFrame = 0
	const TRANSITION_MS = 220

	const current = $derived(items[index] ?? null)
	const hasPrev = $derived(index > 0)
	const hasNext = $derived(index < items.length - 1)

	function cancelReveal() {
		cancelAnimationFrame(revealFrame)
		revealFrame = 0
	}

	function open(detail: GalleryOpenDetail) {
		items = detail.items
		index = Math.max(0, Math.min(detail.index, detail.items.length - 1))
		if (!dialog) {
			return
		}
		if (closeTimer) {
			clearTimeout(closeTimer)
			closeTimer = null
		}
		cancelReveal()
		isClosing = false
		isVisible = false
		if (!dialog.open) {
			dialog.showModal()
		}
		prefetchAdjacent()
		revealFrame = requestAnimationFrame(() => {
			revealFrame = requestAnimationFrame(() => {
				revealFrame = 0
				if (!isClosing && dialog.open) {
					isVisible = true
				}
			})
		})
	}

	function finishClose() {
		cancelReveal()
		closeTimer = null
		if (dialog?.open) {
			dialog.close()
		}
	}

	function close() {
		if (!dialog?.open || isClosing) {
			return
		}
		cancelReveal()
		isClosing = true
		isVisible = false

		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			finishClose()
			return
		}
		closeTimer = setTimeout(finishClose, TRANSITION_MS)
	}

	function handleClose() {
		cancelReveal()
		items = []
		index = 0
		isVisible = false
		isClosing = false
	}

	function goPrev() {
		if (hasPrev) {
			index -= 1
			prefetchAdjacent()
		}
	}

	function goNext() {
		if (hasNext) {
			index += 1
			prefetchAdjacent()
		}
	}

	function goFirst() {
		index = 0
		prefetchAdjacent()
	}

	function goLast() {
		index = items.length - 1
		prefetchAdjacent()
	}

	function prefetchAdjacent() {
		if (typeof Image === 'undefined') {
			return
		}
		for (const offset of [-1, 1]) {
			const i = index + offset
			const item = items[i]
			if (!item) {
				continue
			}
			const img = new Image()
			img.src = item.href
		}
	}

	function handleKey(event: KeyboardEvent) {
		if (!dialog?.open) {
			return
		}
		switch (event.key) {
			case 'ArrowLeft':
				event.preventDefault()
				goPrev()
				break
			case 'ArrowRight':
				event.preventDefault()
				goNext()
				break
			case 'Home':
				event.preventDefault()
				goFirst()
				break
			case 'End':
				event.preventDefault()
				goLast()
				break
		}
	}

	function handleDialogClick(event: MouseEvent) {
		const target = event.target
		if (target instanceof Element) {
			if (target.closest('button')) {
				return
			}
			if (target.closest('.blog-lightbox__image')) {
				return
			}
		}
		close()
	}

	function handleTouchStart(event: TouchEvent) {
		touchStartX = event.touches[0]?.clientX ?? null
	}

	function handleTouchEnd(event: TouchEvent) {
		if (touchStartX === null) {
			return
		}
		const endX = event.changedTouches[0]?.clientX ?? touchStartX
		const delta = endX - touchStartX
		if (Math.abs(delta) > 50) {
			if (delta > 0) {
				goPrev()
			} else {
				goNext()
			}
		}
		touchStartX = null
	}

	function handleGalleryOpen(event: Event) {
		const detail = (event as CustomEvent<GalleryOpenDetail>).detail
		if (detail && Array.isArray(detail.items)) {
			open(detail)
		}
	}

	onMount(() => {
		const galleryOpenListener = (event: Event) => {
			handleGalleryOpen(event)
		}
		document.addEventListener('gallery:open', galleryOpenListener)
		document.addEventListener('keydown', handleKey)
		return () => {
			cancelReveal()
			if (closeTimer) {
				clearTimeout(closeTimer)
			}
			document.removeEventListener('gallery:open', galleryOpenListener)
			document.removeEventListener('keydown', handleKey)
		}
	})
</script>

<dialog
	bind:this={dialog}
	class="blog-lightbox"
	class:blog-lightbox--visible={isVisible}
	aria-label={messages.imageGallery}
	onclick={handleDialogClick}
	oncancel={(event) => {
		event.preventDefault()
		close()
	}}
	onclose={handleClose}
>
	{#if current}
		<div
			class="blog-lightbox__frame"
			role="group"
			aria-label={messages.galleryFrame}
			ontouchstart={handleTouchStart}
			ontouchend={handleTouchEnd}
		>
			<button
				type="button"
				class="blog-lightbox__close"
				aria-label={messages.closeGallery}
				onclick={close}><X size={20} strokeWidth={2} aria-hidden="true" /></button
			>

			{#if items.length > 1}
				<button
					type="button"
					class="blog-lightbox__nav blog-lightbox__nav--prev"
					aria-label={messages.previousImage}
					disabled={!hasPrev}
					onclick={goPrev}><ChevronLeft size={24} strokeWidth={2} aria-hidden="true" /></button
				>
			{/if}

			<figure class="blog-lightbox__figure">
				<img
					class="blog-lightbox__image"
					src={current.href}
					alt={current.alt}
					loading="eager"
					decoding="async"
				/>
				{#if showCaption && current.alt}
					<figcaption class="blog-lightbox__caption">
						<span class="blog-lightbox__caption-text">{current.alt}</span>
						{#if items.length > 1}
							<span class="blog-lightbox__counter"
								>{messages.galleryPosition(index + 1, items.length)}</span
							>
						{/if}
					</figcaption>
				{:else if items.length > 1}
					<figcaption class="blog-lightbox__caption">
						<span class="blog-lightbox__counter"
							>{messages.galleryPosition(index + 1, items.length)}</span
						>
					</figcaption>
				{/if}
			</figure>

			{#if items.length > 1}
				<button
					type="button"
					class="blog-lightbox__nav blog-lightbox__nav--next"
					aria-label={messages.nextImage}
					disabled={!hasNext}
					onclick={goNext}><ChevronRight size={24} strokeWidth={2} aria-hidden="true" /></button
				>
			{/if}
		</div>
	{/if}
</dialog>

<style>
	/*
	 * Theme contract: override these custom properties from a host stylesheet to
	 * reskin the lightbox without forking the component.
	 *   --blog-lightbox-overlay         backdrop fill   (default rgba(6,14,32,0.92))
	 *   --blog-lightbox-accent          accent color    (default #4cd7f6)
	 *   --blog-lightbox-text            primary text    (default #dee5ff)
	 *   --blog-lightbox-muted           muted text      (default #9baad6)
	 *   --blog-lightbox-control-bg      control fill    (default rgba(23,43,84,0.6))
	 *   --blog-lightbox-control-hover   control hover   (default rgba(76,215,246,0.2))
	 */
	.blog-lightbox {
		--blog-lightbox-overlay: rgba(6, 14, 32, 0.92);
		--blog-lightbox-accent: #4cd7f6;
		--blog-lightbox-text: #dee5ff;
		--blog-lightbox-muted: #9baad6;
		--blog-lightbox-control-bg: rgba(23, 43, 84, 0.6);
		--blog-lightbox-control-hover: rgba(76, 215, 246, 0.2);

		width: 100vw;
		max-width: 100vw;
		height: 100vh;
		max-height: 100vh;
		margin: 0;
		padding: 0;
		border: 0;
		background: transparent;
		color: var(--blog-lightbox-text);
		overflow: hidden;
		opacity: 0;
		transition: opacity 220ms ease;
	}

	.blog-lightbox::backdrop {
		background: var(--blog-lightbox-overlay);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		opacity: 0;
		transition: opacity 220ms ease;
	}

	.blog-lightbox[open] {
		display: grid;
		place-items: center;
	}

	.blog-lightbox--visible {
		opacity: 1;
	}

	.blog-lightbox--visible::backdrop {
		opacity: 1;
	}

	.blog-lightbox__frame {
		position: relative;
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: center;
		gap: 1rem;
		width: 100%;
		max-width: min(100vw, 1400px);
		height: 100%;
		padding: clamp(1rem, 4vw, 2.5rem);
		box-sizing: border-box;
		transform: scale(0.985);
		transition: transform 220ms ease;
	}

	.blog-lightbox--visible .blog-lightbox__frame {
		transform: scale(1);
	}

	.blog-lightbox__close {
		position: absolute;
		top: 1rem;
		right: 1rem;
		z-index: 2;
		display: inline-grid;
		place-items: center;
		box-sizing: border-box;
		width: 2.5rem;
		height: 2.5rem;
		min-width: 2.5rem;
		min-height: 2.5rem;
		padding: 0;
		border: 1px solid color-mix(in srgb, var(--blog-lightbox-muted) 40%, transparent);
		border-radius: 50%;
		background: var(--blog-lightbox-control-bg);
		color: var(--blog-lightbox-text);
		line-height: 0;
		cursor: pointer;
		backdrop-filter: blur(12px);
		transition:
			background 0.25s ease,
			border-color 0.25s ease;
	}

	.blog-lightbox__close:hover {
		background: var(--blog-lightbox-control-hover);
		border-color: var(--blog-lightbox-accent);
	}

	.blog-lightbox__nav {
		z-index: 1;
		display: inline-grid;
		place-items: center;
		box-sizing: border-box;
		width: 3rem;
		height: 3rem;
		min-width: 3rem;
		min-height: 3rem;
		padding: 0;
		border: 1px solid color-mix(in srgb, var(--blog-lightbox-muted) 40%, transparent);
		border-radius: 50%;
		background: var(--blog-lightbox-control-bg);
		color: var(--blog-lightbox-text);
		line-height: 0;
		cursor: pointer;
		backdrop-filter: blur(12px);
		transition:
			background 0.25s ease,
			border-color 0.25s ease,
			transform 0.25s ease;
	}

	.blog-lightbox__nav:hover:not(:disabled) {
		background: var(--blog-lightbox-control-hover);
		border-color: var(--blog-lightbox-accent);
		transform: scale(1.06);
	}

	.blog-lightbox__nav:disabled {
		cursor: not-allowed;
		opacity: 0.3;
	}

	.blog-lightbox__close :global(svg),
	.blog-lightbox__nav :global(svg) {
		display: block;
		flex: 0 0 auto;
		margin: 0;
	}

	.blog-lightbox__figure {
		grid-column: 2;
		display: grid;
		grid-template-rows: 1fr auto;
		align-items: center;
		justify-items: center;
		gap: 1rem;
		margin: 0;
		min-height: 0;
	}

	.blog-lightbox__image {
		display: block;
		max-width: 100%;
		max-height: calc(100vh - 6rem);
		width: auto;
		height: auto;
		object-fit: contain;
		border-radius: 12px;
		box-shadow: 0 30px 70px -20px rgba(0, 0, 0, 0.6);
	}

	.blog-lightbox__caption {
		display: flex;
		gap: 1rem;
		align-items: center;
		justify-content: space-between;
		width: min(100%, 720px);
		color: var(--blog-lightbox-muted);
		font-family: inherit;
		font-size: 0.82rem;
		line-height: 1.5;
		text-align: left;
	}

	.blog-lightbox__caption-text {
		flex: 1 1 auto;
		min-width: 0;
		overflow-wrap: anywhere;
	}

	.blog-lightbox__counter {
		flex: 0 0 auto;
		padding: 0.25rem 0.55rem;
		border-radius: 999px;
		background: color-mix(in srgb, var(--blog-lightbox-accent) 14%, transparent);
		color: var(--blog-lightbox-accent);
		font-size: 0.68rem;
		font-weight: 600;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		white-space: nowrap;
	}

	@media (max-width: 40em) {
		.blog-lightbox__frame {
			grid-template-columns: 1fr;
			grid-template-rows: 1fr auto;
			padding: 0.75rem;
		}

		.blog-lightbox__figure {
			grid-column: 1;
			grid-row: 1;
		}

		.blog-lightbox__nav {
			position: absolute;
			bottom: 1rem;
		}

		.blog-lightbox__nav--prev {
			left: 1rem;
		}
		.blog-lightbox__nav--next {
			right: 1rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.blog-lightbox,
		.blog-lightbox::backdrop,
		.blog-lightbox__frame {
			transition-duration: 0.01ms;
		}
	}
</style>
