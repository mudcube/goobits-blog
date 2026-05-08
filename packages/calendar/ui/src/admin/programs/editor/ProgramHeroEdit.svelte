<script lang="ts">
	import { emojiOptions, emojiToTwemojiUrl } from './emoji-options'

	type Props = {
		icon: string
		eyebrow: string
		title: string
		subtitle: string
		preview: boolean
		onCommitIcon: (value: string) => void
		onCommitEyebrow: (value: string) => void
		onCommitTitle: (value: string) => void
		onCommitSubtitle: (value: string) => void
	}

	const {
		icon,
		eyebrow,
		title,
		subtitle,
		preview,
		onCommitIcon,
		onCommitEyebrow,
		onCommitTitle,
		onCommitSubtitle
	}: Props = $props()

	let pickerOpen = $state(false)

	function pickEmoji(emoji: string) {
		onCommitIcon(emoji)
		pickerOpen = false
	}

	function onGlobalClick(event: MouseEvent) {
		const target = event.target as HTMLElement
		if (!target.closest('.program-hero-edit__emoji-wrap')) pickerOpen = false
	}

	function onGlobalKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') pickerOpen = false
	}
</script>

<svelte:window onclick={onGlobalClick} onkeydown={onGlobalKeydown} />

<section class="program-hero-edit">
	<div class="program-hero-edit__glow" aria-hidden="true"></div>

	<div class="program-hero-edit__emoji-wrap">
		<button
			class="program-hero-edit__emoji"
			type="button"
			title="Change icon"
			aria-label={`Current icon ${icon || '💪'}`}
			onclick={() => (pickerOpen = !pickerOpen)}
		>
			<img
				class="program-hero-edit__emoji-glyph"
				src={emojiToTwemojiUrl(icon || '💪')}
				alt=""
				loading="lazy"
				decoding="async"
			/>
		</button>
		{#if pickerOpen}
			<div class="program-hero-edit__emoji-picker">
				{#each emojiOptions as emoji}
					<button
						type="button"
						class="program-hero-edit__emoji-option"
						aria-label={`Use ${emoji}`}
						onclick={() => pickEmoji(emoji)}
					>
						<img
							class="program-hero-edit__emoji-option-glyph"
							src={emojiToTwemojiUrl(emoji)}
							alt=""
							loading="lazy"
							decoding="async"
						/>
					</button>
				{/each}
			</div>
		{/if}
	</div>

	<div
		class="program-hero-edit__editable program-hero-edit__eyebrow"
		contenteditable={!preview}
		spellcheck={false}
		onblur={(event) => onCommitEyebrow(event.currentTarget.textContent || '')}
	>
		{eyebrow || 'Program'}
	</div>

	<div class="program-hero-edit__title-group">
		<div
			class="program-hero-edit__editable program-hero-edit__title"
			contenteditable={!preview}
			spellcheck={false}
			onblur={(event) => onCommitTitle(event.currentTarget.textContent || '')}
		>
			{title || 'Hang out. Work out.\nWhatever.'}
		</div>
	</div>

	<div
		class="program-hero-edit__editable program-hero-edit__subtitle"
		contenteditable={!preview}
		spellcheck={false}
		onblur={(event) => onCommitSubtitle(event.currentTarget.textContent || '')}
	>
		{subtitle || "Grab a time slot and let's do something fun together."}
	</div>
</section>

<style>
	.program-hero-edit {
		position: relative;
		display: grid;
		justify-items: center;
		text-align: center;
		padding: clamp(2rem, 4vw, 3.5rem) 1rem clamp(1.4rem, 2.4vw, 2.1rem);
		margin: 0 auto;
		width: min(100%, 720px);
	}

	.program-hero-edit__glow {
		position: absolute;
		top: -7.5rem;
		left: 50%;
		transform: translateX(-50%);
		width: min(44rem, 100%);
		height: min(44rem, 100vw);
		border-radius: 50%;
		background: radial-gradient(
			circle,
			color-mix(in srgb, #c084fc 14%, transparent) 0%,
			color-mix(in srgb, #a78bfa 8%, transparent) 42%,
			transparent 72%
		);
		pointer-events: none;
		z-index: 0;
	}

	.program-hero-edit__emoji-wrap {
		position: relative;
		margin-bottom: 0.5rem;
		/* Higher than .program-hero-edit__editable (z-index: 1) so the picker
		 * paints over the title/subtitle below. */
		z-index: 20;
	}

	.program-hero-edit__emoji {
		line-height: 0;
		border-radius: 999px;
		padding: 0.42rem;
		border: 1px solid color-mix(in srgb, var(--admin-accent) 28%, transparent);
		background: color-mix(in srgb, var(--admin-accent) 10%, var(--admin-card-bg) 90%);
		cursor: pointer;
		transition: background 140ms, border-color 140ms;
	}

	.program-hero-edit__emoji:hover {
		background: color-mix(in srgb, var(--admin-accent) 18%, var(--admin-card-bg) 82%);
		border-color: color-mix(in srgb, var(--admin-accent) 44%, transparent);
	}

	.program-hero-edit__emoji-glyph {
		width: 2.1rem;
		height: 2.1rem;
		display: block;
	}

	.program-hero-edit__emoji-picker {
		position: absolute;
		top: calc(100% + 0.4rem);
		left: 50%;
		transform: translateX(-50%);
		background: var(--admin-card-bg);
		border: 1px solid var(--admin-card-border);
		border-radius: 0.875rem;
		padding: 0.6rem;
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		gap: 0.25rem;
		max-height: 16rem;
		overflow-y: auto;
		z-index: 9992;
		box-shadow: 0 12px 32px color-mix(in srgb, var(--text) 18%, transparent);
	}

	.program-hero-edit__emoji-option {
		width: 34px;
		height: 34px;
		border: none;
		border-radius: 0.5rem;
		background: transparent;
		padding: 0;
		cursor: pointer;
	}

	.program-hero-edit__emoji-option:hover {
		background: color-mix(in srgb, var(--text) 6%, transparent);
	}

	.program-hero-edit__emoji-option-glyph {
		width: 1.35rem;
		height: 1.35rem;
		display: block;
		margin: 0 auto;
	}

	.program-hero-edit__editable {
		outline: none;
		border-radius: var(--admin-control-radius, 0.625rem);
		padding: 0.2rem 0.75rem;
		text-align: center;
		transition:
			background 0.16s,
			box-shadow 0.16s;
		width: 100%;
		position: relative;
		z-index: 1;
		background-color: transparent;
	}

	.program-hero-edit__editable:hover {
		background-color: color-mix(in srgb, var(--text) 3.5%, transparent);
		/* Dashed outline echoes the panel border — signals this region is
		 * editable. Subtle accent so it doesn't compete with hero copy. */
		outline: 1px dashed color-mix(in srgb, var(--admin-accent) 32%, transparent);
		outline-offset: 2px;
	}

	.program-hero-edit__editable:focus {
		background-color: color-mix(in srgb, var(--text) 5%, transparent);
		box-shadow: 0 0 0 2px color-mix(in srgb, var(--admin-accent) 28%, transparent);
		outline: none;
	}

	.program-hero-edit__eyebrow {
		font-size: 0.82rem;
		font-weight: 600;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		display: inline-block;
		width: auto;
		max-width: 100%;
		background-image: linear-gradient(
			90deg,
			#ff6b6b 0%,
			#feca57 20%,
			#48dbfb 40%,
			#ff9ff3 60%,
			#a78bfa 80%,
			#48dbfb 100%
		);
		background-size: 100% 100%;
		background-repeat: no-repeat;
		color: transparent;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		margin-bottom: 0.55rem;
	}

	.program-hero-edit__eyebrow:hover,
	.program-hero-edit__eyebrow:focus {
		background-color: transparent;
		box-shadow: none;
	}

	.program-hero-edit__title-group {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
	}

	.program-hero-edit__title-group::after {
		content: '';
		display: block;
		width: 60px;
		height: 2.5px;
		border-radius: 2px;
		margin-top: 0.75rem;
		background: linear-gradient(90deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3, #a78bfa);
		opacity: 0.35;
	}

	.program-hero-edit__title {
		font-family: var(--font-display);
		font-size: clamp(2rem, 4.2vw, 3.45rem);
		font-weight: 500;
		letter-spacing: -0.035em;
		line-height: 1.08;
		white-space: pre-wrap;
	}

	.program-hero-edit__subtitle {
		font-size: clamp(1rem, 1.55vw, 1.3rem);
		line-height: 1.55;
		color: color-mix(in srgb, var(--text) 68%, transparent);
		margin-top: 0.9rem;
		max-width: 520px;
		white-space: pre-wrap;
	}
</style>
