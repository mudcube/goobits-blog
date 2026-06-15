<script>
	import { Seo, buildWebPageJsonLd } from '$lib/app/seo'
	import { LegalPage } from '@goobits/ui'

	const description =
		'Cookie policy for MIKO.ART, including essential cookies, authentication sessions, theme preferences, and browser storage.'
</script>

<Seo
	title="Cookie Policy"
	{description}
	path="/cookies/"
	image="/media/page-icons/cookies-cookie.png"
	jsonLd={[
		buildWebPageJsonLd({
			path: '/cookies/',
			title: 'Cookie Policy',
			description
		})
	]}
/>

<LegalPage
	title="Cookie"
	titleAccent="Policy"
	accentColor="#fdba74"
	icon="/media/page-icons/cookies-cookie.png"
	subtitle="What cookies do here, and what they don't."
	updatedAt="February 11, 2026"
	className="legal--cookies"
>

	<p class="legal__copy">
		This page describes how MIKO.ART uses cookies and similar browser storage. The short version: we use the
		minimum required to keep things working.
	</p>

	<h2 class="legal__section-title">What we use cookies for</h2>
	<ul class="legal__list">
		<li class="legal__list-item">Short-lived contact form security checks</li>
		<li class="legal__list-item">Theme preferences stored in browser local storage</li>
	</ul>

	<h2 class="legal__section-title">Cookie types on this site</h2>
	<ul class="legal__list">
		<li class="legal__list-item"><strong class="legal__strong">Essential cookies</strong> - required for form security and basic site behavior</li>
		<li class="legal__list-item"><strong class="legal__strong">Preference storage</strong> - remembers your UI theme setting</li>
	</ul>

	<p class="legal__copy">We don't use analytics cookies, advertising cookies, or third-party tracking of any kind.</p>

	<h2 class="legal__section-title">Current cookie names</h2>
	<p class="legal__copy">
		MIKO.ART does not currently set persistent account, analytics, advertising, or marketing cookies. Browser-local
		storage may keep display preferences such as theme state.
	</p>

	<p class="legal__copy">
		Cookie names may change as features evolve. This
		policy will be updated when material changes are made.
	</p>

	<h2 class="legal__section-title">Managing cookies</h2>
	<p class="legal__copy">
		Most browsers let you block or delete cookies through their settings. Blocking essential cookies will break
		security checks and some forms on this site.
	</p>

	<section class="legal__contact-block">
		<h2 class="legal__section-title legal__section-title--compact">Questions?</h2>
		<p class="legal__copy">
			For anything cookie-related, email <a href="mailto:hello@miko.art">hello@miko.art</a>.
		</p>
	</section>
</LegalPage>
