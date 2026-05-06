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

		--admin-content-max: 720px;
		--admin-control-radius: 0.625rem;
		--admin-text-soft: color-mix(in srgb, var(--text) 60%, transparent);
		--admin-text-muted: color-mix(in srgb, var(--text) 50%, transparent);
		--admin-text-faint: color-mix(in srgb, var(--text) 40%, transparent);
		--admin-muted: var(--muted);
		--admin-border: var(--border);
		--admin-success: #34c759;
		--admin-success-strong: #248a3d;
		--admin-warn: #ff9500;
		--admin-warn-strong: #c27800;
		--admin-danger: #ef4444;
		--admin-danger-strong: #dc2626;
		--admin-danger-soft: #f87171;
		--admin-danger-fg: color-mix(in srgb, var(--admin-danger) 90%, var(--text) 10%);
		--admin-danger-bg-faint: color-mix(in srgb, var(--admin-danger) 8%, var(--bg) 92%);
		--admin-danger-border: color-mix(in srgb, var(--admin-danger) 30%, transparent);

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
