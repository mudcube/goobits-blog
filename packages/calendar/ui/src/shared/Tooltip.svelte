<script lang="ts">
	import { onDestroy, onMount, type Snippet } from 'svelte'

	type Placement = 'top' | 'bottom' | 'left' | 'right'

	const {
		text,
		placement = 'top',
		delay = 250,
		children
	} = $props<{
		text: string
		placement?: Placement
		delay?: number
		children: Snippet
	}>()

	let visible = $state(false)
	let showTimer: ReturnType<typeof setTimeout> | null = null
	let dragActive = $state(false)

	function show() {
		if (showTimer) clearTimeout(showTimer)
		if (!text || dragActive) return
		showTimer = setTimeout(() => {
			if (!dragActive) visible = true
		}, delay)
	}

	function hide() {
		if (showTimer) clearTimeout(showTimer)
		visible = false
	}

	onMount(() => {
		const onDragStart = () => {
			dragActive = true
			hide()
		}
		const onDragEnd = () => {
			dragActive = false
		}
		// Capture phase so we get the event before any handler can stop propagation,
		// and bind on document so we hide on ANY drag in the page (not just our subtree).
		document.addEventListener('dragstart', onDragStart, true)
		document.addEventListener('dragend', onDragEnd, true)
		document.addEventListener('drop', onDragEnd, true)
		// pointerdown also kills the tooltip immediately on click/tap so it doesn't
		// linger over a button the user just pressed.
		document.addEventListener('pointerdown', hide, true)
		return () => {
			document.removeEventListener('dragstart', onDragStart, true)
			document.removeEventListener('dragend', onDragEnd, true)
			document.removeEventListener('drop', onDragEnd, true)
			document.removeEventListener('pointerdown', hide, true)
		}
	})

	onDestroy(() => {
		if (showTimer) clearTimeout(showTimer)
	})
</script>

<span
	class="tooltip"
	class:tooltip--top={placement === 'top'}
	class:tooltip--bottom={placement === 'bottom'}
	class:tooltip--left={placement === 'left'}
	class:tooltip--right={placement === 'right'}
	class:tooltip--visible={visible}
	onmouseenter={show}
	onmouseleave={hide}
	onfocusin={show}
	onfocusout={hide}
	role="presentation"
>
	{@render children()}
	{#if text}
		<span class="tooltip__bubble" role="tooltip" aria-hidden={!visible}>
			{text}
		</span>
	{/if}
</span>

<style>
	.tooltip {
		position: relative;
		display: inline-flex;
		align-items: center;
	}

	.tooltip__bubble {
		position: absolute;
		z-index: 1000;
		pointer-events: none;
		white-space: nowrap;
		max-width: 16rem;
		padding: 0.32rem 0.6rem;
		border-radius: 0.4rem;
		font-family: var(--font-ui-sans, var(--font-sans));
		font-size: 0.7rem;
		font-weight: 540;
		letter-spacing: 0.005em;
		line-height: 1.35;
		background: color-mix(in srgb, var(--text) 92%, var(--bg) 8%);
		color: var(--bg);
		opacity: 0;
		transform: translateY(2px);
		transition: opacity 140ms ease, transform 140ms ease;
		box-shadow: 0 4px 14px color-mix(in srgb, black 28%, transparent);
	}

	.tooltip--visible .tooltip__bubble {
		opacity: 1;
		transform: translateY(0);
	}

	.tooltip--top .tooltip__bubble {
		bottom: calc(100% + 0.4rem);
		left: 50%;
		transform: translate(-50%, 2px);
	}
	.tooltip--top.tooltip--visible .tooltip__bubble {
		transform: translate(-50%, 0);
	}

	.tooltip--bottom .tooltip__bubble {
		top: calc(100% + 0.4rem);
		left: 50%;
		transform: translate(-50%, -2px);
	}
	.tooltip--bottom.tooltip--visible .tooltip__bubble {
		transform: translate(-50%, 0);
	}

	.tooltip--left .tooltip__bubble {
		right: calc(100% + 0.4rem);
		top: 50%;
		transform: translate(2px, -50%);
	}
	.tooltip--left.tooltip--visible .tooltip__bubble {
		transform: translate(0, -50%);
	}

	.tooltip--right .tooltip__bubble {
		left: calc(100% + 0.4rem);
		top: 50%;
		transform: translate(-2px, -50%);
	}
	.tooltip--right.tooltip--visible .tooltip__bubble {
		transform: translate(0, -50%);
	}

	@media (prefers-reduced-motion: reduce) {
		.tooltip__bubble {
			transition: opacity 80ms ease;
			transform: none !important;
		}
	}
</style>
