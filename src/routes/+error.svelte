<script>
	import { Seo } from '$lib/app/seo'
</script>

<Seo title="Not Found" description="The requested MIKO.ART page could not be found." path="/" noindex />

<div class="error-page__container">
	<a class="error-page__link" href="/" aria-label="Return home">
		<img class="error-page__image" src="/media/404-cat.svg" alt="404 Cat" />
	</a>
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
