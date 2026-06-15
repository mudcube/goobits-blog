<script lang="ts">
	type ShowcaseCTAProps = {
		title: string
		titleAccent?: string
		copy: string
		href: string
		linkLabel: string
		className?: string
	}

	const {
		title,
		titleAccent = '',
		copy,
		href,
		linkLabel,
		className = ''
	}: ShowcaseCTAProps = $props()
</script>

<section class={`showcase-cta ${className}`.trim()}>
	<div class="showcase-cta__panel">
		<div class="showcase-cta__copy">
			<h2>
				{title}
				{#if titleAccent}<span>{titleAccent}</span>{/if}
			</h2>
			<p>{copy}</p>
		</div>
		<a href={href} class="showcase-cta__link">{linkLabel}</a>
	</div>
</section>

<style>
	.showcase-cta {
		display: grid;
		grid-template-columns:
			minmax(var(--layout-inline-gutter), 1fr)
			minmax(0, var(--max-width))
			minmax(var(--layout-inline-gutter), 1fr);
		position: relative;
		isolation: isolate;
		padding: var(--space-10) 0;
	}

	.showcase-cta__panel {
		position: relative;
		z-index: 1;
		grid-column: 2;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-10);
		width: 100%;
		overflow: hidden;
		padding: var(--space-10);
		border: var(--border-width) solid var(--showcase-cta-border, rgba(56, 71, 109, 0.1));
		border-radius: var(--radius-md);
		background: var(--showcase-cta-bg, rgba(23, 43, 84, 0.4));
		box-shadow: var(--showcase-cta-shadow, 0 25px 50px -12px rgba(0, 0, 0, 0.35));
	}

	.showcase-cta::before {
		position: absolute;
		inset: 0 auto 0 50%;
		z-index: -1;
		width: 100vw;
		transform: translateX(-50%);
		content: '';
		background:
			linear-gradient(
				180deg,
				color-mix(in srgb, var(--showcase-surface-high) 82%, var(--showcase-surface-low)) 0%,
				var(--showcase-surface) 100%
			);
		pointer-events: none;
	}

	.showcase-cta__panel::before,
	.showcase-cta__panel::after {
		position: absolute;
		width: 24rem;
		height: 24rem;
		border-radius: 999px;
		content: '';
		filter: blur(100px);
		pointer-events: none;
	}

	.showcase-cta__panel::before {
		top: 0;
		right: 0;
		background: var(--showcase-cta-glow-primary, rgba(172, 138, 255, 0.12));
		transform: translate(50%, -50%);
	}

	.showcase-cta__panel::after {
		bottom: 0;
		left: 0;
		background: var(--showcase-cta-glow-secondary, rgba(76, 215, 246, 0.06));
		transform: translate(-50%, 50%);
	}

	.showcase-cta__copy,
	.showcase-cta__link {
		position: relative;
		z-index: 1;
	}

	.showcase-cta__copy h2 {
		margin: 0 0 var(--space-6);
		color: var(--showcase-text);
		font-family: var(--font-serif);
		font-size: clamp(1.45rem, 2.8vw, 1.75rem);
		font-weight: 400;
		letter-spacing: -0.015em;
		line-height: 1.18;
	}

	.showcase-cta__copy h2 span {
		color: var(--showcase-secondary);
		font-style: italic;
	}

	.showcase-cta__copy p {
		max-width: 28rem;
		margin: 0;
		color: var(--showcase-muted);
		font-size: var(--font-size-base);
		line-height: 1.6;
	}

	.showcase-cta__link {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: 3.75rem;
		padding: 0 3rem;
		border-radius: var(--radius-md);
		background: linear-gradient(90deg, var(--showcase-primary), var(--showcase-primary-dim));
		box-shadow: var(--showcase-cta-link-shadow, 0 0 40px -5px rgba(172, 138, 255, 0.4));
		color: var(--showcase-link-text, #000);
		font-size: var(--font-size-xs);
		font-weight: 700;
		letter-spacing: 0.14em;
		text-decoration: none;
		text-transform: uppercase;
		transition:
			box-shadow 0.3s ease,
			transform 0.3s ease;
	}

	.showcase-cta__link:hover {
		box-shadow: var(--showcase-cta-link-shadow-hover, 0 0 60px -5px rgba(172, 138, 255, 0.6));
		transform: scale(1.05);
	}

	@media (max-width: 768px) {
		.showcase-cta {
			padding-top: var(--space-9);
			padding-bottom: var(--space-9);
		}

		.showcase-cta__panel {
			align-items: stretch;
			flex-direction: column;
		}
	}

	@media (max-width: 480px) {
		.showcase-cta__panel {
			padding: var(--space-8);
		}
	}
</style>
