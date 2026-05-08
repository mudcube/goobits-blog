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
	/* Single rounded surface containing host + slug + open link.
	 * Solid resting state so the pill reads as a discrete control even
	 * when it sits on a gradient panel. */
	.url-pill {
		display: flex;
		align-items: center;
		gap: 0;
		flex: 0 1 22rem;
		min-width: 12rem;
		padding: 0.3rem 0.35rem 0.3rem 0.75rem;
		/* Solid (non-alpha-mixed) bg + border so the pill reads as a discrete
		 * control on any backdrop — gradient panels, dark mode, light mode. */
		border: 1px solid color-mix(in srgb, var(--text) 70%, var(--bg));
		background: color-mix(in srgb, var(--bg) 88%, var(--text) 12%);
		border-radius: 999px;
		font-size: 0.82rem;
		font-variant-numeric: tabular-nums;
		min-width: 0;
		box-shadow: 0 1px 2px color-mix(in srgb, var(--text) 12%, transparent),
			inset 0 1px 0 color-mix(in srgb, var(--bg) 70%, transparent);
		transition: border-color 140ms, background 140ms, box-shadow 140ms;
	}

	.url-pill:hover {
		border-color: color-mix(in srgb, var(--text) 80%, var(--bg));
		background: color-mix(in srgb, var(--bg) 82%, var(--text) 18%);
	}

	.url-pill:focus-within {
		border-color: color-mix(in srgb, var(--admin-accent) 55%, transparent);
		background: color-mix(in srgb, var(--admin-accent) 6%, var(--bg));
		box-shadow: 0 0 0 2px color-mix(in srgb, var(--admin-accent) 18%, transparent);
	}

	.url-pill__seg {
		display: flex;
		align-items: center;
		box-sizing: border-box;
	}

	.url-pill__host {
		color: color-mix(in srgb, var(--text) 55%, transparent);
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
		padding: 0 0.1rem;
		margin: 0;
		min-width: 4rem;
		outline: none;
		line-height: 1;
	}

	.url-pill__open {
		display: grid;
		place-items: center;
		width: 1.6rem;
		height: 1.6rem;
		border-radius: 999px;
		color: color-mix(in srgb, var(--text) 55%, transparent);
		text-decoration: none;
		font-size: 0.78rem;
		flex: none;
		transition: background 140ms, color 140ms;
	}

	.url-pill__open:hover {
		background: color-mix(in srgb, var(--text) 8%, transparent);
		color: var(--admin-accent);
	}
</style>
