<script lang="ts">
	import type { NavItem } from '../types/nav'

	type FooterNavProps = {
		brandName?: string
		brandHref?: string
		tagline?: string
		copyrightLabel?: string
		primaryItems: NavItem[]
		supplementalPrimaryItems?: NavItem[]
		elsewhereItems?: NavItem[]
		legalItems: NavItem[]
	}

	const {
		brandName = '',
		brandHref = '/',
		tagline = '',
		copyrightLabel = '',
		primaryItems,
		supplementalPrimaryItems = [],
		elsewhereItems = [],
		legalItems
	}: FooterNavProps = $props()

	const year = new Date().getFullYear()
</script>

<footer class="layout-footer">
	<div class="layout-footer__inner">
		<div class="layout-footer__top">
			<div class="layout-footer__brand">
				<a href={brandHref} class="layout-footer__brand-link">{brandName}</a>
				{#if tagline}
					<p class="layout-footer__tagline">{tagline}</p>
				{/if}
				{#if copyrightLabel}
					<small class="layout-footer__copyright">© {year} {copyrightLabel}</small>
				{/if}
			</div>

			<div class="layout-footer__columns" aria-label="Footer links">
				<div class="layout-footer__col">
					<h3>Explore</h3>
					<ul>
						{#each primaryItems as item}
							<li><a class="layout-footer__col-link" href={item.href}>{item.label}</a></li>
						{/each}
						{#each supplementalPrimaryItems as item}
							<li><a class="layout-footer__col-link" href={item.href}>{item.label}</a></li>
						{/each}
					</ul>
				</div>

				{#if elsewhereItems.length}
					<div class="layout-footer__col">
						<h3>Elsewhere</h3>
						<ul>
							{#each elsewhereItems as item}
								<li>
									<a
										class="layout-footer__col-link"
										href={item.href}
										target={item.external ? '_blank' : undefined}
										rel={item.external ? `noreferrer noopener${item.nofollow === false ? '' : ' nofollow'}` : undefined}
									>
										{item.label}{item.external ? ' ↗' : ''}
									</a>
								</li>
							{/each}
						</ul>
					</div>
				{/if}

				<div class="layout-footer__col">
					<h3>Legal</h3>
					<ul>
						{#each legalItems as item}
							<li><a class="layout-footer__col-link" href={item.href}>{item.label}</a></li>
						{/each}
					</ul>
				</div>
			</div>
		</div>
	</div>
</footer>
