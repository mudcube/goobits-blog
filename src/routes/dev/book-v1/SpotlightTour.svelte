<script lang="ts">
	export type TourStep = {
		selector: string
		message: string
		position?: 'top' | 'bottom'
		phase: number
	}

	let {
		steps,
		storageKey = 'book-tour-done',
		currentPhase = 0,
		onPhaseRequest,
	}: {
		steps: TourStep[]
		storageKey?: string
		currentPhase?: number
		onPhaseRequest?: (phase: number) => void
	} = $props()

	let mode = $state<'idle' | 'prompt' | 'touring'>('idle')
	let current = $state(-1)
	let rect = $state<DOMRect | null>(null)
	let pos = $state<'top' | 'bottom'>('bottom')
	let transitioning = $state(false)

	function autoPrompt() {
		if (typeof localStorage !== 'undefined' && localStorage.getItem(storageKey)) return
		mode = 'prompt'
	}

	function startTour() {
		mode = 'touring'
		transitioning = true
		if (currentPhase !== 0 && onPhaseRequest) onPhaseRequest(0)
		const firstIdx = steps.findIndex(s => s.phase === 0)
		if (firstIdx >= 0) {
			current = firstIdx
			setTimeout(() => { transitioning = false; highlight() }, 350)
		}
	}

	export function showPrompt() {
		mode = 'prompt'
	}

	function highlight() {
		if (current < 0 || current >= steps.length) return
		const step = steps[current]!
		const el = document.querySelector(step.selector)
		if (!el) { advance(); return }
		rect = el.getBoundingClientRect()
		pos = step.position ?? (rect.top > window.innerHeight / 2 ? 'top' : 'bottom')
	}

	function advance() {
		const nextIdx = current + 1
		if (nextIdx >= steps.length) { finish(); return }
		const nextStep = steps[nextIdx]!
		const currentStep = steps[current]!

		// Fade out spotlight elements
		transitioning = true

		if (nextStep.phase !== currentStep.phase && onPhaseRequest) {
			// Phase change: fade out → switch page → fade in
			setTimeout(() => {
				onPhaseRequest!(nextStep.phase)
				current = nextIdx
				setTimeout(() => {
					highlight()
					transitioning = false
				}, 450)
			}, 250)
		} else {
			// Same phase: quick crossfade
			setTimeout(() => {
				current = nextIdx
				highlight()
				transitioning = false
			}, 200)
		}
	}

	function finish() {
		transitioning = true
		setTimeout(() => {
			mode = 'idle'
			current = -1
			rect = null
			transitioning = false
			if (typeof localStorage !== 'undefined') {
				localStorage.setItem(storageKey, '1')
			}
			if (onPhaseRequest) onPhaseRequest(0)
		}, 250)
	}

	function dismissPrompt() {
		mode = 'idle'
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem(storageKey, '1')
		}
	}

	function dismissOverlay() {
		mode = 'idle'
		current = -1
		rect = null
		transitioning = false
	}

	$effect(() => {
		const t = setTimeout(autoPrompt, 600)
		return () => clearTimeout(t)
	})

	$effect(() => {
		if (mode === 'touring' && current >= 0 && !transitioning) {
			const step = steps[current]
			if (step && step.phase === currentPhase) {
				setTimeout(() => highlight(), 150)
			}
		}
	})

	const PAD = 8
	const cutout = $derived(rect ? {
		x: rect.x - PAD, y: rect.y - PAD,
		w: rect.width + PAD * 2, h: rect.height + PAD * 2, r: 12,
	} : null)

	const tipStyle = $derived.by(() => {
		if (!rect) return ''
		const left = Math.max(16, Math.min(rect.x + rect.width / 2, window.innerWidth - 16))
		if (pos === 'top') return `bottom:${window.innerHeight - rect.y + PAD + 12}px; left:${left}px; transform:translateX(-50%);`
		return `top:${rect.y + rect.height + PAD + 12}px; left:${left}px; transform:translateX(-50%);`
	})

	const message = $derived(current >= 0 && current < steps.length ? steps[current]!.message : '')
	const isLast = $derived(current === steps.length - 1)
	const progress = $derived(steps.length > 0 ? ((current + 1) / steps.length) * 100 : 0)
</script>

{#if mode === 'prompt'}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="st-overlay" onpointerdown={dismissPrompt}>
		<svg class="st-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
			<rect width="100" height="100" fill="rgba(4, 4, 12, 0.7)" />
		</svg>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="st-prompt" onpointerdown={(e) => e.stopPropagation()}>
			<p class="st-prompt__title">Want a quick walkthrough?</p>
			<p class="st-prompt__copy">See how booking works — takes about 10 seconds.</p>
			<div class="st-prompt__actions">
				<button type="button" class="st-prompt__skip" onclick={dismissPrompt}>Skip</button>
				<button type="button" class="st-prompt__go" onclick={startTour}>Show me around</button>
			</div>
		</div>
	</div>
{/if}

{#if mode === 'touring'}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="st-overlay" onpointerdown={dismissOverlay}>
		<!-- Dark overlay is always present -->
		<svg class="st-svg" viewBox="0 0 {window.innerWidth} {window.innerHeight}">
			{#if cutout && !transitioning}
				<defs>
					<mask id="st-mask">
						<rect width="100%" height="100%" fill="white" />
						<rect x={cutout.x} y={cutout.y} width={cutout.w} height={cutout.h} rx={cutout.r} fill="black" />
					</mask>
				</defs>
				<rect width="100%" height="100%" fill="rgba(4, 4, 12, 0.7)" mask="url(#st-mask)" />
			{:else}
				<rect width="100%" height="100%" fill="rgba(4, 4, 12, 0.7)" />
			{/if}
		</svg>

		<!-- Ring and tooltip fade in/out -->
		{#if cutout}
			<div class="st-ring" class:st-ring--hidden={transitioning} style="left:{cutout.x}px; top:{cutout.y}px; width:{cutout.w}px; height:{cutout.h}px; border-radius:{cutout.r}px;"></div>
		{/if}

		{#if rect}
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div class="st-tip" class:st-tip--hidden={transitioning} class:st-tip--above={pos === 'bottom'} class:st-tip--below={pos === 'top'} style={tipStyle} onpointerdown={(e) => e.stopPropagation()}>
				<p class="st-tip__msg">{message}</p>
				<div class="st-tip__footer">
					<div class="st-tip__progress"><div class="st-tip__bar" style="width:{progress}%;"></div></div>
					<button type="button" class="st-tip__btn" class:st-tip__btn--done={isLast} onclick={advance}>{isLast ? 'Done' : 'Next'}</button>
				</div>
			</div>
		{/if}
	</div>
{/if}

<style>
	.st-overlay { position: fixed; inset: 0; z-index: 9999; }
	.st-svg { position: absolute; inset: 0; width: 100%; height: 100%; transition: opacity 0.25s ease; }

	.st-prompt { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); width: min(20rem, calc(100vw - 2.5rem)); padding: 1.25rem 1.25rem 1rem; border-radius: 0.75rem; background: rgba(16, 16, 28, 0.95); backdrop-filter: blur(16px); border: 1px solid rgba(167, 139, 250, 0.2); box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5); animation: st-prompt-in 0.3s cubic-bezier(0.16, 1, 0.3, 1); pointer-events: auto; }
	@keyframes st-prompt-in { from { opacity: 0; transform: translate(-50%, -48%) scale(0.96); } to { opacity: 1; transform: translate(-50%, -50%) scale(1); } }
	.st-prompt__title { margin: 0 0 0.35rem; font-family: var(--font-display); font-size: 1.15rem; font-weight: 500; color: #fff; letter-spacing: -0.02em; }
	.st-prompt__copy { margin: 0 0 1rem; font-size: 0.78rem; color: rgba(255, 255, 255, 0.6); line-height: 1.5; }
	.st-prompt__actions { display: flex; gap: 0.5rem; justify-content: flex-end; }
	.st-prompt__skip { padding: 0.4rem 0.85rem; border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 0.4rem; background: transparent; color: rgba(255, 255, 255, 0.5); font: inherit; font-size: 0.72rem; font-weight: 600; cursor: pointer; transition: all 150ms; }
	.st-prompt__skip:hover { color: rgba(255, 255, 255, 0.8); border-color: rgba(255, 255, 255, 0.25); }
	.st-prompt__go { padding: 0.4rem 0.85rem; border: none; border-radius: 0.4rem; background: #a78bfa; color: #fff; font: inherit; font-size: 0.72rem; font-weight: 700; cursor: pointer; transition: background 150ms; }
	.st-prompt__go:hover { background: #8b5cf6; }

	.st-ring { position: absolute; border: 1.5px solid rgba(167, 139, 250, 0.6); pointer-events: none; animation: st-pulse 2s ease-in-out infinite; opacity: 1; transition: opacity 0.2s ease; box-shadow: 0 0 12px rgba(167, 139, 250, 0.15); }
	.st-ring--hidden { opacity: 0; }
	@keyframes st-pulse { 0% { box-shadow: 0 0 0 0 rgba(167, 139, 250, 0.35); } 25% { box-shadow: 0 0 0 4px rgba(167, 139, 250, 0.1); } 50% { box-shadow: 0 0 0 8px rgba(167, 139, 250, 0); } 100% { box-shadow: 0 0 0 0 rgba(167, 139, 250, 0); } }

	.st-tip { position: fixed; width: max-content; max-width: min(20rem, calc(100vw - 2rem)); padding: 0.75rem 1rem; border-radius: 0.65rem; background: rgba(16, 16, 28, 0.95); backdrop-filter: blur(12px); border: 1px solid rgba(167, 139, 250, 0.2); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4); pointer-events: auto; opacity: 1; transition: opacity 0.2s ease; }
	.st-tip--hidden { opacity: 0; pointer-events: none; }
	.st-tip::before { content: ''; position: absolute; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 8px solid transparent; border-right: 8px solid transparent; filter: drop-shadow(0 0 3px rgba(167, 139, 250, 0.15)); }
	.st-tip--above::before { top: -8px; border-bottom: 8px solid rgba(16, 16, 28, 0.95); }
	.st-tip--below::before { bottom: -8px; border-top: 8px solid rgba(16, 16, 28, 0.95); }
	.st-tip__msg { margin: 0 0 0.6rem; font-size: 0.82rem; font-weight: 500; color: rgba(255, 255, 255, 0.9); line-height: 1.45; }
	.st-tip__footer { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; }
	.st-tip__progress { flex: 1; height: 2px; background: rgba(255, 255, 255, 0.1); border-radius: 1px; overflow: hidden; }
	.st-tip__bar { height: 100%; background: #a78bfa; border-radius: 1px; transition: width 0.3s ease; }
	.st-tip__btn { padding: 0.3rem 0.75rem; border: none; border-radius: 0.35rem; background: #a78bfa; color: #fff; font: inherit; font-size: 0.68rem; font-weight: 700; letter-spacing: 0.03em; cursor: pointer; transition: all 150ms; }
	.st-tip__btn:hover { background: #8b5cf6; }
	.st-tip__btn--done { background: #22c55e; }
	.st-tip__btn--done:hover { background: #16a34a; }
</style>
