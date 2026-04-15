<script>
	import Button from '../buttons/Button.svelte'

	const {
		category,
		count,
		accent = '#a78bfa',
		collapsed = false,
		onToggle,
		routes = [],
		getRouteTags,
		formatDate
	} = $props()
</script>

<section class="sitemap-page__category" style={`--accent:${accent};`}>
	<div class="sitemap-page__category-card">
		<div class="sitemap-page__bar" aria-hidden="true"></div>

		<h2 class="sitemap-page__category-title">
			<Button className="sitemap-page__category-header" variant="ghost" size="md" onClick={onToggle} type="button">
				<span class="sitemap-page__category-title-text">{category}</span>
				<span class="sitemap-page__count">{count}</span>
			</Button>
		</h2>

		{#if !collapsed}
			<div class="sitemap-page__category-body">
				<ul class="sitemap-page__route-list">
					{#each routes as route}
						<li
							class={`sitemap-page__route ${route.sitemap === 'internal' ? 'sitemap-page__route--internal' : 'sitemap-page__route--public'}`}
						>
							<div class="sitemap-page__route-main">
								{#if route.type === 'api'}
									<span class="sitemap-page__route-path">{route.path}</span>
									{#if route.httpMethods?.length > 0}
										<span class="sitemap-page__methods">
											{#each route.httpMethods as method}
												<span class={`sitemap-page__method sitemap-page__method--${method.toLowerCase()}`}>{method}</span>
											{/each}
										</span>
									{/if}
								{:else}
									{@const isTemplatePath = route.isDynamic && route.path.includes('[')}
									{#if isTemplatePath}
										<span class="sitemap-page__route-path">{route.path}</span>
									{:else}
										<a href={route.path} class="sitemap-page__route-link">{route.path}</a>
									{/if}
								{/if}
							</div>
							<div class="sitemap-page__route-meta">
								<span
									class={`sitemap-page__audience sitemap-page__audience--${route.sitemap === 'internal' ? 'internal' : 'public'}`}
								>
									{route.sitemap === 'internal' ? 'Internal' : 'Public'}
								</span>
								<div class="sitemap-page__tags">
									{#each getRouteTags(route) as tag}
										<span class={`sitemap-page__tag sitemap-page__tag--${tag.toLowerCase()}`}>{tag}</span>
									{/each}
								</div>
								<span class="sitemap-page__modified">{formatDate(route.lastModified)}</span>
							</div>
						</li>
					{/each}
				</ul>
			</div>
		{/if}
	</div>
</section>
