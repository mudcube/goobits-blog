<script>
	import { Seo } from '$lib/app/seo'
</script>

<Seo title="Not Found" description="The requested MIKO.ART page could not be found." path="/" noindex />

<div class="error-page__container">
    <a href="/">
        <img
                src="/media/404-cat.svg"
                alt="404 Cat"
        />
    </a>
</div>

<style>
	.error-page__container {
		align-items: center;
		display: flex;
		justify-content: center;
		width: 100%;

		a {
			width: 100%;
		}

		img {
			width: inherit;
			max-height: calc(100vh - 300px);
		}
	}
</style>
