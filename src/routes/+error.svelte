<script>
	import { page } from '$app/stores'
	import { Seo } from '$lib/app/seo'

	const status = $derived($page.status ?? 404)
	const message = $derived($page.error?.message ?? 'Page not found')
	const title = $derived(status === 404 ? 'Not Found' : `Error ${status}`)
</script>

<Seo title={title} description="The requested MIKO.ART page could not be found." path="/" noindex />

<div class="error-page__container">
	<a class="error-page__link" href="/" aria-label="Return home">
		<img class="error-page__image" src="/media/decor/404-cat.svg" alt="404 Cat" />
	</a>
	<p class="error-page__status">{status}</p>
	<p class="error-page__message">{message}</p>
</div>

<style>
	.error-page__container {
		align-items: center;
		display: flex;
		justify-content: center;
		min-height: min(72vh, 48rem);
		padding: clamp(1.5rem, 4vw, 3rem);
		width: 100%;
	}

	.error-page__link {
		align-items: center;
		display: flex;
		justify-content: center;
		max-width: min(44rem, 100%);
		text-decoration: none;
		width: 100%;
	}

	.error-page__image {
		display: block;
		height: auto;
		max-height: min(60vh, 34rem);
		max-width: 100%;
		width: min(100%, 42rem);
	}

	.error-page__status {
		margin: 0.75rem 0 0;
		font-size: clamp(1.5rem, 4vw, 2.5rem);
		font-weight: 700;
		color: var(--text);
		text-align: center;
		letter-spacing: -0.02em;
		opacity: 0.7;
	}

	.error-page__message {
		margin: 0.25rem 0 0;
		font-size: clamp(0.85rem, 2vw, 1rem);
		color: var(--muted, var(--text));
		text-align: center;
	}

	@media (max-width: 640px) {
		.error-page__container {
			min-height: 60vh;
			padding: 1rem;
		}

		.error-page__image {
			max-height: 42vh;
			width: min(100%, 28rem);
		}
	}
</style>
