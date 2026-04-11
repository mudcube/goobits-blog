<script lang="ts">
	type ShowcaseCardProps = {
		href: string
		image: string
		alt: string
		badge?: string
		badgeTone?: 'cool' | 'warm'
		title: string
		meta: string
		description?: string
		date?: string
		dateLabel?: string
		playLabel?: string
		loading?: 'eager' | 'lazy'
		fetchpriority?: 'high' | 'auto'
	}

	const {
		href,
		image,
		alt,
		badge = '',
		badgeTone = 'cool',
		title,
		meta,
		description = '',
		date = '',
		dateLabel = '',
		playLabel = 'View',
		loading = 'lazy',
		fetchpriority = 'auto'
	}: ShowcaseCardProps = $props()
</script>

<a href={href} class="showcase-card">
	<div class="showcase-card__art">
		<img src={image} alt={alt} {loading} {fetchpriority} decoding="async" />
		<div class="showcase-card__shade"></div>
		{#if badge}
			<span class={`showcase-card__badge ${badgeTone === 'warm' ? 'showcase-card__badge--warm' : ''}`}>{badge}</span>
		{/if}
		<span class="showcase-card__play" aria-hidden="true">{playLabel}</span>
	</div>
	<div class="showcase-card__copy">
		<h3>{title}</h3>
		<p>{meta}</p>
		{#if description}
			<p class="showcase-card__description">{description}</p>
		{/if}
		{#if date}
			<time datetime={date}>{dateLabel || date}</time>
		{/if}
	</div>
</a>

<style>
	.showcase-card {
		display: flex;
		flex-direction: column;
		min-width: 0;
		color: var(--showcase-text);
		text-decoration: none;
	}

	.showcase-card:hover .showcase-card__art img {
		transform: scale(1.1);
	}

	.showcase-card:hover .showcase-card__play {
		opacity: 1;
		transform: translate(-50%, -50%);
	}

	.showcase-card__art {
		position: relative;
		aspect-ratio: 4 / 3;
		overflow: hidden;
		border-radius: var(--radius-md);
		background:
			linear-gradient(180deg, var(--showcase-surface-bright) 0%, var(--showcase-surface-highest) 100%);
		box-shadow: var(--showcase-card-shadow, 0 25px 50px -12px rgba(0, 0, 0, 0.45));
	}

	.showcase-card__art img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.7s ease;
	}

	.showcase-card__shade {
		position: absolute;
		inset: 0;
		background: linear-gradient(to top, rgba(0, 0, 0, 0.72), rgba(0, 0, 0, 0));
		opacity: 0.6;
	}

	.showcase-card__badge {
		position: absolute;
		top: 1rem;
		right: 1rem;
		padding: 0.25rem 0.75rem;
		border: var(--border-width) solid var(--showcase-badge-border, rgba(76, 215, 246, 0.2));
		border-radius: var(--radius-md);
		background: var(--showcase-badge-bg, rgba(0, 42, 51, 0.6));
		color: var(--showcase-badge-text, var(--showcase-secondary-on-container));
		font-size: 0.625rem;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		backdrop-filter: blur(12px);
	}

	.showcase-card__badge--warm {
		border-color: var(--showcase-badge-warm-border, rgba(254, 166, 25, 0.2));
		background: var(--showcase-badge-warm-bg, rgba(254, 166, 25, 0.4));
		color: var(--showcase-badge-warm-text, var(--showcase-tertiary-on-container));
	}

	.showcase-card__play {
		position: absolute;
		top: 50%;
		left: 50%;
		display: inline-grid;
		place-items: center;
		width: 4rem;
		height: 4rem;
		border: 1px solid var(--showcase-play-border, rgba(172, 138, 255, 0.4));
		border-radius: var(--radius-pill);
		background: var(--showcase-play-bg, rgba(172, 138, 255, 0.2));
		box-shadow: var(--showcase-play-shadow, 0 0 30px rgba(172, 138, 255, 0.4));
		color: var(--showcase-text);
		font-size: 0.7rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		opacity: 0;
		transform: translate(-50%, calc(-50% + 1rem));
		backdrop-filter: blur(12px);
		transition:
			opacity 0.5s ease,
			transform 0.5s ease;
	}

	.showcase-card__copy {
		margin-top: var(--space-5);
	}

	.showcase-card__copy h3 {
		margin: 0 0 var(--space-2);
		color: var(--showcase-text);
		font-family: var(--font-serif);
		font-size: var(--font-size-xl);
		font-weight: 400;
		letter-spacing: -0.015em;
		line-height: 1.2;
		overflow-wrap: anywhere;
	}

	.showcase-card__copy p,
	.showcase-card__copy time {
		display: block;
		margin: 0;
		color: var(--showcase-tertiary);
		font-size: var(--font-size-xs);
		font-weight: 700;
		letter-spacing: 0.09em;
		text-transform: uppercase;
	}

	.showcase-card__copy time {
		margin-top: var(--space-1);
		color: var(--showcase-muted);
	}

	.showcase-card__description {
		margin-top: var(--space-3) !important;
		color: var(--showcase-muted) !important;
		font-size: var(--font-size-sm) !important;
		font-weight: 400 !important;
		letter-spacing: 0 !important;
		line-height: 1.55;
		text-transform: none !important;
	}
</style>
