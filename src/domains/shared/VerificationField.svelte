<script lang="ts">
	const {
		siteKey,
		label = 'Verification',
		copy,
		className = ''
	} = $props<{
		siteKey: string
		label?: string
		copy: string
		className?: string
	}>()
</script>

<div class={`verification-field ui-form-field ${className}`.trim()}>
	<div class="verification-field__head">
		<p class="verification-field__label">{label}</p>
		<p class="verification-field__copy">{copy}</p>
	</div>
	<div class="verification-field__shell">
		<div class="cf-turnstile" data-sitekey={siteKey}></div>
	</div>
</div>

<style>
	.verification-field {
		display: grid;
		gap: 0.6rem;
	}

	.verification-field__head {
		display: grid;
		gap: 0.18rem;
	}

	.verification-field__label {
		margin: 0;
		font-size: var(--font-size-xs);
		font-weight: 700;
		letter-spacing: 0.02em;
		color: var(--text);
	}

	.verification-field__copy {
		margin: 0;
		font-size: var(--font-size-xs);
		line-height: 1.45;
		color: color-mix(in srgb, var(--muted) 90%, var(--text));
	}

	.verification-field__shell {
		display: flex;
		align-items: center;
		justify-content: flex-start;
		min-height: 5.25rem;
		padding: 0.85rem 1rem;
		border-radius: 1rem;
		border: 1px solid color-mix(in srgb, var(--border) 76%, transparent);
		background:
			linear-gradient(
				180deg,
				color-mix(in srgb, var(--card-bg) 94%, white 6%),
				color-mix(in srgb, var(--card-bg) 84%, transparent)
			),
			color-mix(in srgb, var(--bg) 82%, transparent);
		box-shadow: inset 0 1px 0 color-mix(in srgb, white 65%, transparent);
	}

	.verification-field__shell :global(.cf-turnstile) {
		max-width: 100%;
	}

	.verification-field__shell :global(iframe) {
		max-width: 100%;
	}
</style>
