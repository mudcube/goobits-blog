<script lang="ts">
	const { text = 'Loading…' } = $props<{ text?: string }>()
</script>

<p class="admin-loading-text">{text}</p>

<style>
	.admin-loading-text {
		margin: 0;
		padding: 0.6rem 0.95rem;
		font-size: 0.8rem;
		color: color-mix(in srgb, var(--text) 52%, transparent);
	}
</style>
