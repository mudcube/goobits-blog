<script>
	import { apps } from './_projects.ts'
	import '$lib/app/theme/home.css'
	import { Seo, buildPersonJsonLd, buildWebPageJsonLd, buildWebsiteJsonLd } from '$lib/app/seo'

	const description =
		'Creative software, playful design tools, music experiments, and process notes from Miko Meow.'
</script>

<Seo
	title="Creative Software, Design Tools & Music Experiments"
	{description}
	path="/"
	image="/media/projects/project-sketchpad.webp"
	jsonLd={[
		buildWebsiteJsonLd(),
		buildPersonJsonLd(),
		buildWebPageJsonLd({
			path: '/',
			title: 'Creative Software, Design Tools & Music Experiments',
			description
		})
	]}
/>

<div class="home home__hero">
    <h1 class="home__hero-title">MAKE, LEARN&hellip; PLAY!</h1>
    <h2 class="home__hero-subtitle">APPS CRAFTED WITH
        <img
                src="/media/decor/emoji-sparkling-heart.png"
                height="40"
                width="40"
                class="home__hero-heart"
                alt=""
        />
    </h2>
</div>

<div class="home__projects">
    {#each apps as { id, description, title, url }}
        <a class="home__project" href="{url}">
            <span class="home__project-image" style="background-image: url('/media/projects/project-{id}.webp')"></span>
            <span class="home__project-description">{description}</span>
            <span class="home__project-title"><span class="home__project-title-text">{title}</span></span>
        </a>
    {/each}
</div>

<!--<h1>ENJOY ART</h1>-->
<!--<h2>MADE WITH GENERATIVE ALGORITHMS ✨</h2>-->
<!--<projects>-->
<!--    {#each art as {id, description, title, url}, i}-->
<!--        <a class="project" href="{url}">-->
<!--            <project-image style="background-image: url('/media/projects/project-{id}.webp')"></project-image>-->
<!--            <project-description>{description}</project-description>-->
<!--            <project-title><span>{title}</span></project-title>-->
<!--        </a>-->
<!--    {/each}-->
<!--</projects>-->

<style>
	.home__hero-heart {
		vertical-align: top;
	}
</style>
