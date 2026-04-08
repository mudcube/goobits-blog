<script lang="ts">
	import BookingCalendar from './BookingCalendar.svelte'
	import type { CalendarActivityConfig } from '@calendar/core'
	import type { CalendarEventsResponse } from '../../api/calendar'

	const {
		activity,
		upcoming = [],
		mockMode = false
	} = $props<{
		activity: CalendarActivityConfig
		upcoming?: CalendarEventsResponse['upcoming']
		mockMode?: boolean
	}>()

	const title = $derived(activity.heroTitleLines.join('\n'))

	function emojiToTwemojiUrl(emoji: string) {
		const code = Array.from(emoji.replace(/\uFE0F/g, ''))
			.map((ch) => ch.codePointAt(0)?.toString(16))
			.filter((part): part is string => !!part)
			.join('-')
		return `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${code}.svg`
	}
</script>

<svelte:head>
	<title>{activity.pageTitle}</title>
</svelte:head>

<div class="calendar-page calendar-activity calendar-activity--{activity.slug} program-editor">
	<div class="program-editor__panel">
		<section class="program-editor__hero">
			<div class={`program-editor__hero-glow ${activity.glowClass || ''}`} aria-hidden="true"></div>
			<div class="program-editor__emoji-wrap">
				<div class="program-editor__emoji" aria-hidden="true">
					<img class="program-editor__emoji-glyph" src={emojiToTwemojiUrl(activity.icon || '💪')} alt="" loading="lazy" decoding="async" />
				</div>
			</div>
			<div class={`program-editor__eyebrow ${activity.eyebrowClass || ''}`}>{activity.eyebrow}</div>
			<div class="program-editor__title-group">
				<div class="program-editor__title">{title}</div>
			</div>
			<div class="program-editor__subtitle">{activity.heroSubtitle}</div>
			{#if activity.serviceStatusNote}
				<p class="program-editor__service-note">{activity.serviceStatusNote}</p>
			{/if}
		</section>

		<BookingCalendar initialUpcoming={upcoming} {mockMode} />
	</div>
</div>

<style lang="scss">
	.program-editor {
		--bg: var(--bg);
		--surface: color-mix(in srgb, var(--panel-bg) 88%, var(--text) 12%);
		--text: var(--text);
		--admin-accent: color-mix(in srgb, var(--link) 72%, #7a5af8 28%);
		--admin-calendar-border-uniform: color-mix(in srgb, var(--text) 14%, transparent);
		--admin-calendar-arrow-fg: color-mix(in srgb, var(--text) 60%, transparent);
		--admin-calendar-arrow-hover-fg: color-mix(in srgb, var(--admin-accent) 80%, var(--text) 20%);
		--admin-calendar-weekday-row-bg: #1f1f23;
		--admin-calendar-weekday-row-fg: #f7f7fb;
		--admin-calendar-dot: color-mix(in srgb, var(--admin-accent) 76%, var(--text) 24%);
		--admin-calendar-selected-bg: color-mix(in srgb, var(--admin-accent) 11%, transparent);
		--admin-calendar-selected-border: color-mix(in srgb, var(--admin-accent) 62%, transparent);

		width: 100%;
		max-width: none;
		border-radius: 0;
		border: 0;
		overflow: visible;
		background:
			radial-gradient(ellipse 520px 360px at 52% 68px, color-mix(in srgb, #a78bfa 16%, transparent) 0%, transparent 72%),
			radial-gradient(ellipse 500px 320px at 78% 22%, color-mix(in srgb, #f0abfc 10%, transparent) 0%, transparent 72%),
			var(--bg);
	}

	.program-editor__panel {
		width: 100%;
		padding: 1.1rem 1rem 1.65rem;
		display: flex;
		flex-direction: column;
		align-items: stretch;
		background:
			linear-gradient(
				180deg,
				color-mix(in srgb, #efe7ff 78%, var(--bg) 22%) 0%,
				color-mix(in srgb, #f8f4ff 86%, var(--bg) 14%) 100%
			);
	}

	.program-editor__hero {
		position: relative;
		display: grid;
		justify-items: center;
		text-align: center;
		padding: clamp(2rem, 4vw, 3.5rem) 1rem clamp(1.4rem, 2.4vw, 2.1rem);
		margin: 0 auto;
		width: min(100%, 720px);
	}

	.program-editor__hero-glow {
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

	.program-editor__emoji-wrap {
		position: relative;
		margin-bottom: 0.5rem;
		z-index: 1;
	}

	.program-editor__emoji {
		line-height: 0;
		border-radius: 999px;
		padding: 0.42rem;
		border: 1px solid color-mix(in srgb, #7a5af8 24%, transparent);
		background: color-mix(in srgb, #efe7ff 74%, var(--bg) 26%);
	}

	.program-editor__emoji-glyph {
		width: 2.1rem;
		height: 2.1rem;
		display: block;
	}

	.program-editor__eyebrow {
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

	.program-editor__title-group {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
	}

	.program-editor__title-group::after {
		content: '';
		display: block;
		width: 60px;
		height: 2.5px;
		border-radius: 2px;
		margin-top: 0.75rem;
		background: linear-gradient(90deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3, #a78bfa);
		opacity: 0.35;
	}

	.program-editor__title {
		font-family: var(--font-display);
		font-size: clamp(2rem, 4.2vw, 3.45rem);
		font-weight: 500;
		letter-spacing: -0.035em;
		line-height: 1.08;
		white-space: pre-wrap;
		position: relative;
		z-index: 1;
	}

	.program-editor__subtitle {
		font-size: clamp(1rem, 1.55vw, 1.3rem);
		line-height: 1.55;
		color: color-mix(in srgb, var(--text) 68%, transparent);
		margin-top: 0.9rem;
		max-width: 520px;
		white-space: pre-wrap;
		position: relative;
		z-index: 1;
	}

	.program-editor__service-note {
		margin-top: 0.7rem;
		max-width: 42rem;
		font-size: 0.84rem;
		color: color-mix(in srgb, var(--text) 55%, transparent);
		position: relative;
		z-index: 1;
	}

	.program-editor :global(.calendar-page__section.calendar-home__section) {
		margin: 0;
		padding: 0;
	}

	.program-editor :global(.calendar-home__feed-head) {
		margin: 0;
		padding: 0;
	}
</style>
