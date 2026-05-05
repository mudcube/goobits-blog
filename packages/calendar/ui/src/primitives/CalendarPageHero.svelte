<script lang="ts">
	const {
		eyebrow = '',
		title = '',
		titleLines,
		subtitle = '',
		emoji,
		emojiAlt = '',
		serviceStatusNote
	} = $props<{
		eyebrow?: string
		title?: string
		titleLines?: string[]
		subtitle?: string
		emoji?: string
		emojiAlt?: string
		serviceStatusNote?: string
	}>()

	const lines = $derived(titleLines && titleLines.length > 0 ? titleLines : title ? [title] : [])

	function emojiToTwemojiUrl(value: string) {
		const code = Array.from(value.replace(/️/g, ''))
			.map((ch) => ch.codePointAt(0)?.toString(16))
			.filter((part): part is string => !!part)
			.join('-')
		return `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${code}.svg`
	}
</script>

<section class="calendar-page-hero">
	<div class="calendar-page-hero__glow" aria-hidden="true"></div>
	{#if emoji}
		<div class="calendar-page-hero__emoji-wrap">
			<div class="calendar-page-hero__emoji" aria-hidden={emojiAlt ? undefined : 'true'}>
				<img
					class="calendar-page-hero__emoji-glyph"
					src={emojiToTwemojiUrl(emoji)}
					alt={emojiAlt}
					loading="lazy"
					decoding="async"
				/>
			</div>
		</div>
	{/if}
	{#if eyebrow}
		<div class="calendar-page-hero__eyebrow">{eyebrow}</div>
	{/if}
	<div class="calendar-page-hero__title-group">
		{#if lines.length > 0}
			<h1 class="calendar-page-hero__title">{#each lines as line, i}{#if i > 0}<br />{/if}{line}{/each}</h1>
		{/if}
	</div>
	{#if subtitle}
		<p class="calendar-page-hero__subtitle">{subtitle}</p>
	{/if}
	{#if serviceStatusNote}
		<p class="calendar-page-hero__service-note">{serviceStatusNote}</p>
	{/if}
</section>

<style lang="scss">
	.calendar-page-hero {
		position: relative;
		display: grid;
		justify-items: center;
		text-align: center;
		padding: clamp(2rem, 4vw, 3.5rem) 1rem clamp(1.4rem, 2.4vw, 2.1rem);
		margin: 0 auto;
		width: min(100%, 720px);
	}

	.calendar-page-hero__glow {
		position: absolute;
		top: -7.5rem;
		left: 50%;
		transform: translateX(-50%);
		width: min(44rem, 100%);
		height: min(44rem, 100vw);
		border-radius: 50%;
		background: radial-gradient(
			circle,
			color-mix(in srgb, var(--admin-accent, #a78bfa) 14%, transparent) 0%,
			color-mix(in srgb, var(--admin-accent, #a78bfa) 8%, transparent) 42%,
			transparent 72%
		);
		pointer-events: none;
		z-index: 0;
	}

	.calendar-page-hero__emoji-wrap {
		position: relative;
		margin-bottom: 0.5rem;
		z-index: 1;
	}

	.calendar-page-hero__emoji {
		line-height: 0;
		border-radius: 999px;
		padding: 0.55rem;
		border: 1px solid color-mix(in srgb, var(--text) 14%, transparent);
		background: color-mix(in srgb, var(--text) 88%, var(--bg) 12%);
		box-shadow: 0 6px 18px -8px color-mix(in srgb, black 38%, transparent);
	}

	.calendar-page-hero__emoji-glyph {
		width: 2.1rem;
		height: 2.1rem;
		display: block;
	}

	.calendar-page-hero__eyebrow {
		font-family: var(--font-ui-sans, var(--font-sans));
		font-size: 0.82rem;
		font-weight: 600;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		display: inline-block;
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
		position: relative;
		z-index: 1;
	}

	.calendar-page-hero__title-group {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
	}

	.calendar-page-hero__title-group::after {
		content: '';
		display: block;
		width: 60px;
		height: 2.5px;
		border-radius: 2px;
		margin-top: 0.75rem;
		background: linear-gradient(90deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3, #a78bfa);
		opacity: 0.35;
	}

	.calendar-page-hero__title {
		margin: 0;
		font-family: var(--font-display);
		font-size: clamp(2rem, 4.2vw, 3.45rem);
		font-weight: 500;
		letter-spacing: -0.035em;
		line-height: 1.08;
		white-space: pre-wrap;
		position: relative;
		z-index: 1;
	}

	.calendar-page-hero__subtitle {
		font-family: var(--font-ui-sans, var(--font-sans));
		font-size: clamp(1rem, 1.55vw, 1.3rem);
		line-height: 1.55;
		color: color-mix(in srgb, var(--text) 68%, transparent);
		margin: 0.9rem 0 0;
		max-width: 520px;
		white-space: pre-wrap;
		position: relative;
		z-index: 1;
	}

	.calendar-page-hero__service-note {
		margin-top: 0.7rem;
		max-width: 42rem;
		font-size: 0.84rem;
		color: color-mix(in srgb, var(--text) 55%, transparent);
		position: relative;
		z-index: 1;
	}
</style>
