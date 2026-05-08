<script lang="ts">
	/**
	 * URL pill: host prefix + editable slug + open-link arrow.
	 *
	 * The wrapper around the slug `<input>` is what fixes vertical alignment
	 * (native inputs render text at a different baseline than sibling spans
	 * even with `align-items: center` on the parent). Each segment uses
	 * `display: flex; align-items: center` so the centering is identical
	 * regardless of element type.
	 */
	let {
		slug = $bindable('morning-yoga'),
		host = 'miko.art/schedule/',
		ariaLabel = 'URL slug',
		previewLabel = 'Open public page in a new tab',
		onInput,
		onCommit
	} = $props<{
		slug?: string
		host?: string
		ariaLabel?: string
		previewLabel?: string
		/** Fired on every keystroke. Use this when the parent needs to write
		 * through a getter/setter (e.g. a controller `programDraft` proxy)
		 * rather than bind directly. */
		onInput?: (value: string) => void
		onCommit?: () => void
	}>()

	const previewHref = $derived(`https://${host}${slug}`)
</script>

<div class="url-pill">
	<span class="url-pill__seg url-pill__host">{host}</span>
	<span class="url-pill__seg url-pill__slug-wrap">
		<input
			class="url-pill__slug"
			type="text"
			bind:value={slug}
			spellcheck="false"
			aria-label={ariaLabel}
			oninput={(event) => onInput?.(event.currentTarget.value)}
			onblur={() => onCommit?.()}
		/>
	</span>
	<a
		class="url-pill__seg url-pill__open"
		href={previewHref}
		target="_blank"
		rel="noopener noreferrer"
		aria-label={previewLabel}
	>
		<span aria-hidden="true">↗</span>
	</a>
</div>

<style>
	.url-pill {
		display: flex;
		align-items: stretch;
		flex: 0 1 22rem;
		min-width: 12rem;
		height: 32px;
		border: 1px solid color-mix(in srgb, var(--text) 12%, transparent);
		border-radius: 0.5rem;
		overflow: hidden;
		background: var(--bg);
		font-size: 0.82rem;
		font-variant-numeric: tabular-nums;
		transition: border-color 140ms, box-shadow 140ms;
	}

	.url-pill:hover {
		border-color: color-mix(in srgb, var(--text) 22%, transparent);
	}

	.url-pill:focus-within {
		border-color: color-mix(in srgb, var(--admin-accent) 50%, transparent);
		box-shadow: 0 0 0 2px color-mix(in srgb, var(--admin-accent) 18%, transparent);
	}

	.url-pill__seg {
		display: flex;
		align-items: center;
		box-sizing: border-box;
	}

	.url-pill__host {
		padding: 0 0.6rem;
		color: color-mix(in srgb, var(--text) 60%, transparent);
		background: color-mix(in srgb, var(--text) 5%, transparent);
		border-right: 1px solid color-mix(in srgb, var(--text) 10%, transparent);
		white-space: nowrap;
	}

	.url-pill__slug-wrap {
		flex: 1;
		min-width: 0;
	}

	.url-pill__slug {
		width: 100%;
		appearance: none;
		border: 0;
		background: transparent;
		font: inherit;
		color: var(--text);
		font-weight: 600;
		padding: 0 0.55rem;
		margin: 0;
		min-width: 0;
		outline: none;
		line-height: 1;
	}

	.url-pill__open {
		min-width: 32px;
		justify-content: center;
		border-left: 1px solid color-mix(in srgb, var(--text) 10%, transparent);
		color: color-mix(in srgb, var(--text) 60%, transparent);
		text-decoration: none;
		transition: background 140ms, color 140ms;
	}

	.url-pill__open:hover {
		background: color-mix(in srgb, var(--text) 5%, transparent);
		color: var(--admin-accent);
	}
</style>
