<script lang="ts">
	import { RELEASE_STAGE_COOKIE, type ReleaseStage } from '$lib/release'

	type Props = {
		activeStage: ReleaseStage
	}

	const { activeStage }: Props = $props()
	const stages: ReleaseStage[] = ['live', 'preview']

	function setStage(stage: ReleaseStage) {
		document.cookie = `${RELEASE_STAGE_COOKIE}=${stage}; Path=/; Max-Age=31536000; SameSite=Lax`
		window.location.reload()
	}
</script>

<aside class="release-switcher" aria-label="Site release preview">
	<div class="release-switcher__label">Preview</div>
	<div class="release-switcher__options">
		{#each stages as stage}
			<button
				type="button"
				class="release-switcher__button"
				class:release-switcher__button--active={stage === activeStage}
				onclick={() => setStage(stage)}
				aria-pressed={stage === activeStage}
			>
				{stage === 'live' ? 'Live' : 'Preview'}
			</button>
		{/each}
	</div>
</aside>

<style lang="scss">
	.release-switcher {
		position: fixed;
		right: 1rem;
		bottom: 1rem;
		z-index: 40;
		display: grid;
		gap: 0.5rem;
		padding: 0.75rem;
		border: 1px solid color-mix(in srgb, var(--text) 12%, transparent);
		border-radius: 12px;
		background: color-mix(in srgb, var(--bg) 92%, white 8%);
		box-shadow: 0 12px 30px rgba(0, 0, 0, 0.14);
		backdrop-filter: blur(14px);
	}

	.release-switcher__label {
		font-size: 0.72rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--muted);
	}

	.release-switcher__options {
		display: flex;
		gap: 0.4rem;
	}

	.release-switcher__button {
		min-width: 3rem;
		padding: 0.45rem 0.7rem;
		border: 1px solid color-mix(in srgb, var(--text) 10%, transparent);
		border-radius: 999px;
		background: color-mix(in srgb, var(--card-bg) 90%, var(--bg));
		color: var(--text);
		font-size: 0.82rem;
		font-weight: 700;
		cursor: pointer;
	}

	.release-switcher__button--active {
		border-color: transparent;
		background: var(--text);
		color: var(--bg);
	}

	@media (max-width: 56em) {
		.release-switcher {
			right: 0.85rem;
			bottom: 0.85rem;
			padding: 0.55rem;
			gap: 0.35rem;
		}

		.release-switcher__label {
			font-size: 0.64rem;
		}

		.release-switcher__options {
			gap: 0.3rem;
		}

		.release-switcher__button {
			min-width: 2.5rem;
			padding: 0.35rem 0.55rem;
			font-size: 0.72rem;
		}
	}

	@media (max-width: 48em) {
		.release-switcher {
			display: none;
		}
	}

	@media (max-width: 40em) {
		.release-switcher {
			display: none;
		}
	}
</style>
