<script lang="ts">
	import { PillButton } from '@miko/ui'
	import { DEV_SURFACE_COOKIE, type DevSurface } from '$lib/app/dev-surface'
	import { RELEASE_STAGE_COOKIE, type ReleaseStage } from '$lib/app/release'

	type Props = {
		activeStage: ReleaseStage
		activeSurface: DevSurface
	}

	const { activeStage, activeSurface }: Props = $props()
	const stages = [
		{ value: 'live', label: 'Live' },
		{ value: 'preview', label: 'Preview' }
	]
	const surfaces = [
		{ value: 'staging', label: 'Staging' },
		{ value: 'dev', label: 'Dev' }
	]

	function setStage(stage: ReleaseStage) {
		document.cookie = `${RELEASE_STAGE_COOKIE}=${stage}; Path=/; Max-Age=31536000; SameSite=Lax`
		window.location.reload()
	}

	function setSurface(surface: DevSurface) {
		document.cookie = `${DEV_SURFACE_COOKIE}=${surface}; Path=/; Max-Age=31536000; SameSite=Lax`
		window.location.reload()
	}

	function handleStageChange(stage: string | string[]) {
		if (typeof stage === 'string') setStage(stage as ReleaseStage)
	}

	function handleSurfaceChange(surface: string | string[]) {
		if (typeof surface === 'string') setSurface(surface as DevSurface)
	}
</script>

<aside class="release-switcher" aria-label="Site release preview">
	<div class="release-switcher__row">
		<span class="release-switcher__label">Release</span>
		<PillButton
			options={stages}
			value={activeStage}
			grouped
			className="release-switcher__toggle"
			ariaLabel="Release stage"
			onChange={handleStageChange}
		/>
	</div>

	<div class="release-switcher__row">
		<span class="release-switcher__label">Surface</span>
		<PillButton
			options={surfaces}
			value={activeSurface}
			grouped
			className="release-switcher__toggle"
			ariaLabel="Local surface"
			onChange={handleSurfaceChange}
		/>
	</div>
</aside>

<style lang="scss">
	.release-switcher {
		position: fixed;
		right: 1rem;
		bottom: 1rem;
		z-index: 40;
		display: grid;
		grid-template-columns: auto auto;
		gap: 0.45rem 0.65rem;
		padding: 0.55rem;
		border: 1px solid color-mix(in srgb, var(--text) 12%, transparent);
		border-radius: 14px;
		background: color-mix(in srgb, var(--bg) 92%, white 8%);
		box-shadow: 0 12px 30px rgba(0, 0, 0, 0.14);
		backdrop-filter: blur(14px);
	}

	.release-switcher__row {
		display: grid;
		grid-column: 1 / -1;
		grid-template-columns: 3.7rem 1fr;
		align-items: center;
		gap: 0.5rem;
	}

	.release-switcher__label {
		font-size: 0.62rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--muted);
	}

	:global(.release-switcher__toggle.ui-segmented) {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		width: 100%;
		padding: 0.15rem;
		background: color-mix(in srgb, var(--card-bg) 88%, var(--bg));
	}

	:global(.release-switcher__toggle .ui-segmented__button) {
		display: grid;
		place-items: center;
		width: 100%;
		padding: 0.26rem 0.45rem;
		font-size: 0.68rem;
		font-weight: 700;
		line-height: 1.1;
		text-align: center;
	}

	:global(.release-switcher__toggle .ui-segmented__button--active) {
		background: var(--text);
		color: var(--bg);
	}

	@media (max-width: 56em) {
		.release-switcher {
			right: 0.85rem;
			bottom: 0.85rem;
			padding: 0.45rem;
			gap: 0.35rem;
		}

		.release-switcher__label {
			font-size: 0.58rem;
		}

		.release-switcher__row {
			grid-template-columns: 3.25rem 1fr;
			gap: 0.35rem;
		}

		:global(.release-switcher__toggle .ui-segmented__button) {
			padding: 0.22rem 0.35rem;
			font-size: 0.62rem;
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
