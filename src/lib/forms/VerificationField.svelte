<script lang="ts">
	const {
		siteKey,
		className = ''
	} = $props<{
		siteKey: string
		className?: string
	}>()
</script>

<div class={`verification-field ui-form-field ${className}`.trim()}>
	<div class="verification-field__widget" aria-label="Verification">
		<div class="cf-turnstile" data-sitekey={siteKey}></div>
	</div>
</div>

<style>
	.verification-field {
		display: block;
		margin-top: -0.5rem;
		padding: 0 0 1rem;
	}

	.verification-field__widget {
		display: block;
	}

	.verification-field__widget :global(.cf-turnstile) {
		max-width: 100%;
	}

	.verification-field__widget :global(iframe) {
		display: block;
		max-width: 100%;
	}
</style>
