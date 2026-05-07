<script lang="ts">
	let {
		emoji = '🧘',
		eyebrow = $bindable(''),
		titleLine1 = $bindable(''),
		titleLine2 = $bindable(''),
		subtitle = $bindable(''),
		previewHref = '#'
	} = $props<{
		emoji?: string
		eyebrow?: string
		titleLine1?: string
		titleLine2?: string
		subtitle?: string
		previewHref?: string
	}>()
</script>

<section class="hero-edit" aria-label="Public-page hero">
	<div class="hero-edit__emoji" aria-hidden="true">
		<span class="hero-edit__emoji-glyph">{emoji}</span>
	</div>
	<input
		class="hero-edit__field hero-edit__eyebrow"
		type="text"
		bind:value={eyebrow}
		placeholder="Eyebrow"
		aria-label="Hero eyebrow"
	/>
	<div class="hero-edit__title-group">
		<input
			class="hero-edit__field hero-edit__title"
			type="text"
			bind:value={titleLine1}
			placeholder="Title line 1"
			aria-label="Hero title line 1"
		/>
		<input
			class="hero-edit__field hero-edit__title"
			type="text"
			bind:value={titleLine2}
			placeholder="Title line 2"
			aria-label="Hero title line 2"
		/>
	</div>
	<input
		class="hero-edit__field hero-edit__sub"
		type="text"
		bind:value={subtitle}
		placeholder="Subtitle"
		aria-label="Hero subtitle"
	/>
	<p class="hero-edit__caption">
		This is your public page hero.
		<a class="hero-edit__caption-link" href={previewHref} target="_blank" rel="noopener noreferrer">Preview ↗</a>
	</p>
</section>

<style>
	.hero-edit {
		position: relative;
		padding: 1.4rem 1rem 1.1rem;
		border-radius: 0.95rem;
		background:
			radial-gradient(
				ellipse at top,
				color-mix(in srgb, var(--admin-accent) 14%, transparent) 0%,
				transparent 60%
			),
			color-mix(in srgb, var(--admin-accent) 4%, var(--bg) 96%);
		border: 1px solid color-mix(in srgb, var(--admin-accent) 18%, transparent);
		display: grid;
		justify-items: center;
		gap: 0.3rem;
		min-width: 0;
		text-align: center;
		overflow: hidden;
	}

	.hero-edit__emoji {
		display: grid;
		place-items: center;
		width: 2.4rem;
		height: 2.4rem;
		border-radius: 999px;
		border: 1px solid color-mix(in srgb, var(--text) 14%, transparent);
		background: color-mix(in srgb, var(--text) 88%, var(--bg) 12%);
		box-shadow: 0 6px 18px -8px color-mix(in srgb, black 38%, transparent);
		margin-bottom: 0.35rem;
	}

	.hero-edit__emoji-glyph {
		font-size: 1.15rem;
		line-height: 1;
	}

	.hero-edit__field {
		appearance: none;
		border: 1px solid transparent;
		background: transparent;
		color: inherit;
		font: inherit;
		padding: 0.15rem 0.4rem;
		border-radius: 0.45rem;
		min-width: 0;
		max-width: 100%;
		text-align: center;
		transition: background 120ms, border-color 120ms;
		outline: none;
	}

	.hero-edit__field:hover {
		background: color-mix(in srgb, var(--text) 5%, transparent);
		cursor: text;
	}

	.hero-edit__field:focus-visible {
		background: color-mix(in srgb, var(--admin-accent) 7%, transparent);
		border-color: color-mix(in srgb, var(--admin-accent) 40%, transparent);
	}

	.hero-edit__field::placeholder {
		color: var(--admin-text-muted);
		font-style: italic;
		opacity: 0.65;
	}

	.hero-edit__eyebrow {
		font-family: var(--font-ui-sans, var(--font-sans));
		font-size: 0.74rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		background-image: linear-gradient(
			90deg,
			#ff6b6b 0%,
			#feca57 20%,
			#48dbfb 40%,
			#ff9ff3 60%,
			#a78bfa 80%,
			#48dbfb 100%
		);
		background-clip: text;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		color: transparent;
	}

	.hero-edit__eyebrow::placeholder {
		-webkit-text-fill-color: var(--admin-text-muted);
		color: var(--admin-text-muted);
	}

	.hero-edit__title-group {
		display: grid;
		justify-items: center;
		gap: 0.05rem;
		width: 100%;
		position: relative;
		padding-bottom: 0.7rem;
	}

	.hero-edit__title-group::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
		width: 48px;
		height: 2px;
		border-radius: 2px;
		background: linear-gradient(90deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3, #a78bfa);
		opacity: 0.4;
	}

	.hero-edit__title {
		font-family: var(--font-display, var(--font-serif, serif));
		font-size: 1.45rem;
		font-weight: 500;
		line-height: 1.08;
		letter-spacing: -0.035em;
		color: var(--text);
		width: 100%;
	}

	.hero-edit__sub {
		margin-top: 0.45rem;
		font-family: var(--font-ui-sans, var(--font-sans));
		font-size: 0.86rem;
		line-height: 1.45;
		color: color-mix(in srgb, var(--text) 68%, transparent);
		width: 100%;
	}

	.hero-edit__caption {
		margin: 0.55rem 0 0;
		font-size: 0.7rem;
		color: var(--admin-text-muted);
	}

	.hero-edit__caption-link {
		color: var(--admin-text-soft);
		text-decoration: none;
		font-weight: 600;
		transition: color 140ms;
	}

	.hero-edit__caption-link:hover { color: var(--admin-accent); }
</style>
