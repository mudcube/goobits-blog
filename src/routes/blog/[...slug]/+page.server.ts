import { redirect } from '@sveltejs/kit'

export const prerender = false

export function load({ params }: { params: { slug?: string } }) {
	const slug = params.slug ? `/${ params.slug }` : ''
	throw redirect(308, `/journal${ slug }`)
}
