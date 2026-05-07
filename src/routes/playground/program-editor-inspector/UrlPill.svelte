<script lang="ts">
	let { slug = $bindable('morning-yoga'), host = 'miko.art/schedule/' } = $props<{
		slug?: string
		host?: string
	}>()
</script>

<div class="url-pill">
	<span class="url-pill__seg url-pill__host">{host}</span>
	<span class="url-pill__seg url-pill__slug">
		<input
			class="url-pill__input"
			type="text"
			bind:value={slug}
			aria-label="URL slug"
		/>
	</span>
	<a
		class="url-pill__seg url-pill__open"
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
		box-sizing: border-box;
	}

	.url-pill:hover { border-color: var(--ins-control-border-hover); }

	.url-pill:focus-within {
		border-color: var(--ins-control-border-focus);
		box-shadow: var(--ins-control-focus-ring);
	}

	/* Every segment is a flex container that centers its content vertically.
	 * This works the same for <span>, <input>, and <a> contents — the parent
	 * does the centering, not the element itself. */
	.url-pill__seg {
		display: flex;
		align-items: center;
		box-sizing: border-box;
	}

	.url-pill__host {
		padding: 0 var(--ins-control-pad-x);
		color: var(--ins-control-fg-muted);
		background: var(--ins-control-bg-soft);
		border-right: 1px solid var(--ins-control-bg-soft-divider);
		white-space: nowrap;
	}

	.url-pill__slug { flex: 1; min-width: 0; }

	.url-pill__input {
		width: 100%;
		appearance: none;
		border: 0;
		background: transparent;
		font: inherit;
		color: var(--ins-control-fg);
		font-weight: var(--ins-control-font-weight);
		padding: 0 var(--ins-control-pad-x);
		margin: 0;
		outline: none;
		min-width: 0;
		/* line-height: 1 keeps the input's intrinsic height tight to its glyphs;
		 * the wrapper's align-items:center centers it inside the segment. */
		line-height: 1;
	}

	.url-pill__open {
		min-width: var(--ins-control-h);
		justify-content: center;
		border-left: 1px solid var(--ins-control-bg-soft-divider);
		color: var(--ins-control-fg-muted);
		text-decoration: none;
		font-size: var(--ins-control-font-size);
		transition: background 140ms, color 140ms;
	}

	.url-pill__open:hover {
		background: var(--ins-control-bg-soft);
		color: var(--admin-accent);
	}
</style>
