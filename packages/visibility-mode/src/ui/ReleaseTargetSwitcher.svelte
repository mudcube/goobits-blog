<script lang="ts">
	import type { Snippet } from 'svelte'
	import {
		RELEASE_STAGE_COOKIE,
		TARGET_COOKIE,
		type ReleaseStage,
		type Target
	} from '../index.js'

	type RowOption = { value: string; label: string }
	type RowSnippet = Snippet<[string, RowOption[], string, (value: string) => void, string]>

	type Props = {
		activeStage: ReleaseStage
		activeTarget: Target
		stageCookieName?: string
		targetCookieName?: string
		ariaLabel?: string
		/**
		 * Optional extra rows rendered below Stage + Target. Use this for
		 * site-specific toggles (e.g. sitemap visibility) so the switcher stays
		 * a single floating widget. The snippet receives a helper that builds a
		 * row in the same visual style: `Row(label, options, active, onSelect, ariaLabel)`.
		 */
		extraRows?: Snippet<[{ Row: RowSnippet }]>
	}

	const {
		activeStage,
		activeTarget,
		stageCookieName = RELEASE_STAGE_COOKIE,
		targetCookieName = TARGET_COOKIE,
		ariaLabel = 'Site release controls',
		extraRows
	}: Props = $props()

	const stages = [
		{ value: 'live' as const, label: 'Live' },
		{ value: 'preview' as const, label: 'Preview' }
	]
	const targets = [
		{ value: 'dev' as const, label: 'Dev' },
		{ value: 'production' as const, label: 'Production' }
	]

	function writeCookie(name: string, value: string) {
		document.cookie = `${name}=${value}; Path=/; Max-Age=31536000; SameSite=Lax`
	}

	function setStage(stage: ReleaseStage) {
		writeCookie(stageCookieName, stage)
		window.location.reload()
	}

	function setTarget(target: Target) {
		writeCookie(targetCookieName, target)
		window.location.reload()
	}
</script>

{#snippet Row(label: string, options: { value: string; label: string }[], active: string, onSelect: (value: string) => void, rowAria: string)}
	<div class="visibility-switcher__row">
		<span class="visibility-switcher__label">{label}</span>
		<div class="visibility-switcher__toggle" role="group" aria-label={rowAria}>
			{#each options as option}
				<button
					type="button"
					class="visibility-switcher__button"
					class:visibility-switcher__button--active={active === option.value}
					aria-pressed={active === option.value}
					onclick={() => onSelect(option.value)}
				>
					{option.label}
				</button>
			{/each}
		</div>
	</div>
{/snippet}

<aside class="visibility-switcher" aria-label={ariaLabel}>
	{@render Row('Release', stages, activeStage, (v) => setStage(v as ReleaseStage), 'Release stage')}
	{@render Row('Target', targets, activeTarget, (v) => setTarget(v as Target), 'Target environment')}
	{@render extraRows?.({ Row })}
</aside>

<style lang="scss">
	.visibility-switcher {
		position: fixed;
		right: 1rem;
		bottom: 1rem;
		z-index: 100;
		display: grid;
		grid-template-columns: minmax(0, 18rem);
		gap: 0.45rem;
		padding: 0.55rem 0.65rem;
		border: 1px solid color-mix(in srgb, currentColor 14%, transparent);
		border-radius: 14px;
		background: color-mix(in srgb, Canvas 94%, transparent);
		color: CanvasText;
		box-shadow: 0 12px 30px rgba(0, 0, 0, 0.18);
		backdrop-filter: blur(14px);
		-webkit-backdrop-filter: blur(14px);
	}

	:global(.visibility-switcher__row) {
		display: grid;
		grid-template-columns: 3.7rem minmax(0, 1fr);
		align-items: center;
		gap: 0.5rem;
	}

	:global(.visibility-switcher__label) {
		font-size: 0.62rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		opacity: 0.7;
	}

	:global(.visibility-switcher__toggle) {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		width: 100%;
		padding: 0.15rem;
		border-radius: 10px;
		background: color-mix(in srgb, currentColor 8%, transparent);
	}

	:global(.visibility-switcher__button) {
		display: grid;
		place-items: center;
		width: 100%;
		padding: 0.26rem 0.45rem;
		border: 0;
		border-radius: 8px;
		background: transparent;
		color: inherit;
		font: inherit;
		font-size: 0.68rem;
		font-weight: 700;
		line-height: 1.1;
		text-align: center;
		cursor: pointer;
		transition: background-color 0.12s ease, color 0.12s ease;
	}

	:global(.visibility-switcher__button:hover) {
		background: color-mix(in srgb, currentColor 8%, transparent);
	}

	:global(.visibility-switcher__button--active) {
		background: currentColor;
		color: Canvas;
	}

	@media (max-width: 56em) {
		.visibility-switcher {
			right: 0.85rem;
			bottom: 0.85rem;
			padding: 0.45rem;
			gap: 0.35rem;
		}

		:global(.visibility-switcher__label) {
			font-size: 0.58rem;
		}

		:global(.visibility-switcher__row) {
			grid-template-columns: 3.25rem 1fr;
			gap: 0.35rem;
		}

		:global(.visibility-switcher__button) {
			padding: 0.22rem 0.35rem;
			font-size: 0.62rem;
		}
	}
</style>
