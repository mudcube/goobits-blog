<script lang="ts">
	let {
		className = '',
		eyebrowClass = '',
		glowClass = '',
		titleClass = '',
		subtitleClass = '',
		eyebrow,
		title,
		titleLines,
		subtitle,
		icon,
		iconAlt = '',
		compact = false
	}: {
		className?: string
		eyebrowClass?: string
		glowClass?: string
		titleClass?: string
		subtitleClass?: string
		eyebrow?: string
		title?: string
		titleLines?: string[]
		subtitle?: string
		icon?: string
		iconAlt?: string
		compact?: boolean
	} = $props()
</script>

<section class={`calendar-hero ${compact ? 'calendar-hero--compact' : ''} ${className}`.trim()}>
	{#if glowClass}<div class={glowClass} aria-hidden="true"></div>{/if}
	{#if eyebrow}<p class={`calendar-hero__eyebrow ${eyebrowClass}`.trim()}>{eyebrow}</p>{/if}
	{#if titleLines?.length}
		<h1 class={`calendar-hero__title ${titleClass}`.trim()}>
			{#each titleLines as line}<span>{line}</span>{/each}
		</h1>
	{:else if title}
		<h1 class={`calendar-hero__title ${titleClass}`.trim()}>{title}</h1>
	{/if}
	{#if subtitle}<p class={`calendar-hero__subtitle ${subtitleClass}`.trim()}>{subtitle}</p>{/if}
	{#if icon}<img class="calendar-hero__icon" src={icon} alt={iconAlt} />{/if}
</section>

<style>
	.calendar-hero {
		position: relative;
		display: grid;
		gap: 0.6rem;
	}
	.calendar-hero--compact { gap: 0.45rem; }
	.calendar-hero__eyebrow { margin: 0; font-size: 0.82rem; text-transform: uppercase; letter-spacing: 0.06em; }
	.calendar-hero__title { margin: 0; display: grid; gap: 0.15rem; }
	.calendar-hero__title span { display: block; }
	.calendar-hero__subtitle { margin: 0; }
	.calendar-hero__icon { width: 2.2rem; height: 2.2rem; object-fit: contain; }
</style>
