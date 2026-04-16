import { Badge, Box, Frame, HandCoins } from '@lucide/svelte'

export const artWorkTypes = [
	{ label: 'Merch', href: '/contact?from=art&topic=merch', icon: Badge },
	{ label: 'Packaging', href: '/contact?from=art&topic=packaging', icon: Box },
	{ label: 'Exhibits', href: '/contact?from=art&topic=venue', icon: Frame },
	{ label: 'Commissions', href: '/contact?from=art&topic=commissions_exhibits', icon: HandCoins }
]

export const artWorks = [
	{
		title: 'Portland Ketchup Summer Tee',
		category: 'T-shirt design',
		image: '/media/placeholders/product-stub-1.svg',
		note: 'Playful bottle mascot system and back-print layout for a seasonal apparel drop.',
		badge: 'Screen Print Ready'
	},
	{
		title: 'Late-Night Fries Club Shirt',
		category: 'T-shirt design',
		image: '/media/placeholders/product-stub-2.svg',
		note: 'Bold one-color graphic concept built for high-contrast screen printing.',
		badge: 'Merch System'
	},
	{
		title: 'Ketchup & Friends Sticker Set',
		category: 'Merch',
		image: '/media/placeholders/product-stub-3.svg',
		note: 'Character-led sticker sheet ideas with alternate expressions and mini slogans.',
		badge: 'Character Pack'
	},
	{
		title: 'Hot Dog Cart Label Refresh',
		category: 'Packaging',
		image: '/media/placeholders/product-stub-4.svg',
		note: 'Retro-inspired label direction balancing shelf readability with playful voice.',
		badge: 'Shelf Refresh'
	},
	{
		title: 'Funny Condiment Pin Collection',
		category: 'Accessories',
		image: '/media/placeholders/product-stub-5.svg',
		note: 'Enamel pin concepts featuring cheeky micro-copy and icon-forward silhouettes.',
		badge: 'Product Drop'
	},
	{
		title: 'Weekend Market Tote Series',
		category: 'Soft goods',
		image: '/media/placeholders/product-stub-6.svg',
		note: 'Reusable tote family with modular lockups for events, popups, and collabs.',
		badge: 'Retail Set'
	},
	{
		title: 'Snackline Poster Pack',
		category: 'Print',
		image: '/media/placeholders/product-stub-7.svg',
		note: 'Whimsical promotional posters designed as companion pieces to apparel launches.',
		badge: 'Campaign Art'
	},
	{
		title: 'Pickle Parade Apron',
		category: 'Kitchenware',
		image: '/media/placeholders/product-stub-8.svg',
		note: 'Front-pocket print layout with oversized character art and punchy typography.',
		badge: 'Kitchen Collab'
	},
	{
		title: 'Festival Booth Sign Kit',
		category: 'Brand system',
		image: '/media/placeholders/product-stub-9.svg',
		note: 'Coordinated signage concepts tying merch, menu boards, and giveaway cards together.',
		badge: 'Booth System'
	}
]
