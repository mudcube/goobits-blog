<script lang="ts">
	import '@calendar/theme/admin.scss'
	import NoIndexHead from '$lib/app/seo/NoIndexHead.svelte'

	const { children } = $props()
</script>

<NoIndexHead />

<div class="playground-shell">
	{@render children()}
</div>

<style>
	.playground-shell {
		--admin-accent: color-mix(in srgb, var(--link) 72%, #7a5af8 28%);
		--admin-card-bg: color-mix(in srgb, var(--admin-accent) 6%, var(--bg) 94%);
		--admin-card-border: color-mix(in srgb, var(--admin-accent) 18%, transparent);
		--admin-card-bg-hover: color-mix(in srgb, var(--admin-accent) 10%, var(--bg) 90%);

		--book-accent: var(--admin-accent);
		--book-accent-dim: color-mix(in srgb, var(--admin-accent) 78%, var(--bg) 22%);
		--book-accent-deep: color-mix(in srgb, var(--admin-accent) 90%, var(--text) 10%);
		--book-success: #22c55e;
		--book-danger: #ef4444;

		--playground-required: color-mix(in srgb, #b45309 70%, var(--text) 30%);
		--playground-required-bg: color-mix(in srgb, #b45309 14%, transparent);
		--playground-highlight: #facc15;

		min-height: 100vh;
	}
</style>
