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
	/* Two-zone pill: fixed host on the left (recessed/muted, divider on right),
	 * editable slug on the right (clean editable surface). The visual split
	 * makes it obvious which segment is interactive. */
	.url-pill {
		display: flex;
		align-items: stretch;
		gap: 0;
		flex: 0 1 22rem;
		min-width: 12rem;
		/* No padding on the pill itself — segments fill it edge-to-edge so
		 * the host's recessed bg can read as a distinct zone. */
		padding: 0;
		/* Outer border matches the segment dividers (text 28% mixed) so the
		 * pill reads as a quiet, unified shape — the structure comes from
		 * the host/slug/open zones, not a loud accent ring. */
		border: 1px solid color-mix(in srgb, var(--text) 28%, transparent);
		background: var(--bg);
		border-radius: 999px;
		font-size: 0.82rem;
		font-variant-numeric: tabular-nums;
		min-width: 0;
		overflow: hidden;
		transition: border-color 140ms, box-shadow 140ms;
	}

	.url-pill:hover {
		border-color: color-mix(in srgb, var(--text) 40%, transparent);
	}

	.url-pill:focus-within {
		border-color: color-mix(in srgb, var(--admin-accent) 60%, transparent);
		box-shadow: 0 0 0 2px color-mix(in srgb, var(--admin-accent) 18%, transparent);
	}

	.url-pill__seg {
		display: flex;
		align-items: center;
		box-sizing: border-box;
	}

	/* Fixed host zone: solid muted-gray bg makes it visually heavy and
	 * clearly NOT an input. Italic + muted text + no-select reinforces. */
	.url-pill__host {
		padding: 0 0.7rem 0 0.85rem;
		color: color-mix(in srgb, var(--text) 65%, var(--bg));
		/* Strong solid fill — ~22% text on bg reads as a clearly tinted chip
		 * even on top of gradient panels. Don't drop below 18%. */
		background: color-mix(in srgb, var(--text) 22%, var(--bg) 78%);
		border-right: 1px solid color-mix(in srgb, var(--text) 28%, transparent);
		white-space: nowrap;
		font-style: italic;
		user-select: none;
	}

	/* Editable slug zone: clean white-ish surface so the input feels
	 * crisp and editable. Subtle accent tint on focus. */
	.url-pill__slug-wrap {
		flex: 1;
		min-width: 0;
		padding: 0 0.45rem;
		background: var(--bg);
		transition: background 140ms;
	}

	.url-pill:focus-within .url-pill__slug-wrap {
		background: color-mix(in srgb, var(--admin-accent) 5%, var(--bg) 95%);
	}

	.url-pill__slug {
		width: 100%;
		appearance: none;
		border: 0;
		background: transparent;
		font: inherit;
		color: var(--text);
		font-weight: 600;
		padding: 0.32rem 0.1rem;
		margin: 0;
		min-width: 4rem;
		outline: none;
		line-height: 1.2;
	}

	.url-pill__open {
		display: grid;
		place-items: center;
		width: 2rem;
		flex: none;
		color: color-mix(in srgb, var(--text) 65%, var(--bg));
		text-decoration: none;
		font-size: 0.78rem;
		background: color-mix(in srgb, var(--text) 22%, var(--bg) 78%);
		border-left: 1px solid color-mix(in srgb, var(--text) 28%, transparent);
		transition: background 140ms, color 140ms;
	}

	.url-pill__open:hover {
		background: color-mix(in srgb, var(--admin-accent) 22%, var(--bg) 78%);
		color: var(--admin-accent);
	}
</style>
