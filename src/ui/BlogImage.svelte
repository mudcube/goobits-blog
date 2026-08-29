<script lang="ts">
	import type { BlogImage } from '../core/blogPost.js'

	interface Props {
		image: BlogImage
		sizes?: string
		loading?: 'eager' | 'lazy'
		fetchpriority?: 'high' | 'low' | 'auto'
	}

	const {
		image,
		sizes = image.sizes,
		loading = 'lazy',
		fetchpriority = 'auto'
	}: Props = $props()
</script>

<picture>
	{#if image.sources?.avif}
		<source type="image/avif" srcset={image.sources.avif} {sizes} />
	{/if}
	{#if image.sources?.webp}
		<source type="image/webp" srcset={image.sources.webp} {sizes} />
	{/if}
	<img
		src={image.src}
		alt={image.alt}
		width={image.width}
		height={image.height}
		{loading}
		decoding="async"
		{fetchpriority}
	/>
</picture>
