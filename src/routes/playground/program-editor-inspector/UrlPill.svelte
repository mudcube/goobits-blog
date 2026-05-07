<script lang="ts">
	let { slug = $bindable('morning-yoga'), host = 'miko.art/schedule/' } = $props<{
		slug?: string
		host?: string
	}>()
</script>

<div class="url-pill">
	<span class="url-pill__host">{host}</span>
	<input
		class="url-pill__input"
		type="text"
		bind:value={slug}
		aria-label="URL slug"
	/>
	<a
		class="url-pill__open"
		href="https://{host}{slug}"
		target="_blank"
		rel="noopener noreferrer"
		aria-label="Open public page in a new tab"
	>
		<span aria-hidden="true">↗</span>
	</a>
</div>

<style>
	.url-pill {
		display: flex;
		align-items: stretch;
		height: var(--ins-control-h);
		border: 1px solid var(--ins-control-border);
		border-radius: var(--ins-control-radius);
		overflow: hidden;
		background: var(--ins-control-bg);
		font-size: var(--ins-control-font-size);
		font-variant-numeric: tabular-nums;
		transition: border-color 140ms, box-shadow 140ms;
	}

	.url-pill:hover { border-color: var(--ins-control-border-hover); }

	.url-pill:focus-within {
		border-color: var(--ins-control-border-focus);
		box-shadow: var(--ins-control-focus-ring);
	}

	.url-pill__host {
		display: flex;
		align-items: center;
		padding: 0 var(--ins-control-pad-x);
		color: var(--ins-control-fg-muted);
		background: var(--ins-control-bg-soft);
		border-right: 1px solid var(--ins-control-bg-soft-divider);
		white-space: nowrap;
		line-height: 1;
	}

	.url-pill__input {
		appearance: none;
		border: none;
		background: transparent;
		font: inherit;
		color: var(--ins-control-fg);
		font-weight: var(--ins-control-font-weight);
		padding: 0 var(--ins-control-pad-x);
		flex: 1;
		min-width: 0;
		outline: none;
		line-height: 1;
		height: 100%;
	}

	.url-pill__open {
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: var(--ins-control-h);
		border-left: 1px solid var(--ins-control-bg-soft-divider);
		color: var(--ins-control-fg-muted);
		text-decoration: none;
		font-size: 0.9rem;
		transition: background 140ms, color 140ms;
	}

	.url-pill__open:hover {
		background: var(--ins-control-bg-soft);
		color: var(--admin-accent);
	}
</style>
