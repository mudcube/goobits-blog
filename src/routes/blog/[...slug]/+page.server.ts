import { error, redirect } from '@sveltejs/kit'

export const prerender = false

export function load({ params }: { params: { slug?: string } }) {
	if (params.slug === 'rss.xml') {
		throw error(404, 'Not found')
	}

	const slug = params.slug ? `/${ params.slug }` : ''
	throw redirect(308, `/journal${ slug }`)
}
