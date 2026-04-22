<script lang="ts">
	import ShowcaseCollectionPage from '@src/domains/showcase/ShowcaseCollectionPage.svelte'
	import type { ShowcaseCollectionConfig } from '@src/domains/showcase/config'
	import { labEntries } from './catalog'

	const config: ShowcaseCollectionConfig = {
		path: '/labs/',
		seoTitle: 'Creative Coding Labs',
		description: 'Browse playful web experiments, prototypes, and creative coding labs from Miko Meow.',
		eyebrow: 'Labs',
		title: 'Experiments, tools, and',
		titleAccent: 'browser curiosities',
		icon: '/media/page-icons/labs-flask.png',
		iconAlt: 'Labs flask icon',
		intro: 'A cabinet of playful browser sketches, tiny creative tools, old prototypes, and odd technical artifacts from different eras of the web.',
		signalLabel: 'Lab Archive No. 010',
		gridTitle: 'Experiment Index',
		gridKicker: 'Small tools, visual sketches, audio toys, and browser-side experiments',
		gridFilterLabel: 'View // Browser Labs',
		ctaTitle: 'Want a custom',
		ctaTitleAccent: 'creative tool?',
		ctaCopy: 'Interactive prototypes, visual experiments, educational tools, or browser-native ideas built to fit a project.',
		ctaHref: '/contact?from=labs&topic=creative_tooling',
		ctaLinkLabel: 'Start a Conversation'
	}
</script>

<ShowcaseCollectionPage
	{...config}
	entries={labEntries}
/>
