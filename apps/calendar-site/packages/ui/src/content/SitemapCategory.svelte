<script>
	import { ChevronDown } from '@lucide/svelte'

	const {
		category,
		count,
		tone = 'primary',
		icon: Icon,
		collapsed = false,
		onToggle,
		routes = [],
		getRouteTags,
		formatDate
	} = $props()
</script>

<section class={`sitemap-page__category sitemap-page__category--${tone}`}>
	<div class="sitemap-page__category-card">
		<button
			type="button"
			class="sitemap-page__category-header"
			aria-expanded={!collapsed}
			onclick={onToggle}
		>
			{#if Icon}
				<span class="sitemap-page__category-icon" aria-hidden="true">
					<Icon size={16} strokeWidth={2} />
				</span>
			{/if}
			<span class="sitemap-page__category-title">{category}</span>
			<span class="sitemap-page__count">{count}</span>
			<span
				class={`sitemap-page__toggle-icon${collapsed ? ' sitemap-page__toggle-icon--collapsed' : ''}`}
				aria-hidden="true"
			>
				<ChevronDown size={16} strokeWidth={2} />
			</span>
		</button>

		{#if !collapsed}
			<ul class="sitemap-page__route-list">
				{#each routes as route}
					<li
						class={`sitemap-page__route ${route.sitemap === 'internal' ? 'sitemap-page__route--internal' : 'sitemap-page__route--public'}`}
					>
						<span
							class={`sitemap-page__route-dot sitemap-page__route-dot--${route.sitemap === 'internal' ? 'internal' : 'public'}`}
							aria-hidden="true"
						></span>
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
						<div class="sitemap-page__tags">
							{#each getRouteTags(route) as tag}
								<span class={`sitemap-page__tag sitemap-page__tag--${tag.toLowerCase()}`}>{tag}</span>
							{/each}
						</div>
						<span class="sitemap-page__modified">{formatDate(route.lastModified)}</span>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</section>
