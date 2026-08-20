import { describe, expect, it } from 'vitest'

import { rehypeExternalLinks } from '../../src/markdown/rehypeExternalLinks.js'

function link(href: string): Record<string, unknown> {
	return { type: 'element', tagName: 'a', properties: { href }, children: [] }
}

describe('rehypeExternalLinks', () => {
	it('hardens unowned links while leaving owned and internal links in place', () => {
		const external = link('https://elsewhere.example/post')
		const owned = link('https://docs.miko.art/post')
		const internal = link('/journal/post')
		const tree = { type: 'root', children: [external, owned, internal] }

		rehypeExternalLinks({ ownedDomains: ['miko.art'] })(tree)

		expect(external).toMatchObject({
			properties: {
				href: 'https://elsewhere.example/post',
				rel: ['noopener', 'noreferrer', 'nofollow'],
				target: '_blank'
			}
		})
		expect(owned).toEqual(link('https://docs.miko.art/post'))
		expect(internal).toEqual(link('/journal/post'))
	})

	it('neutralizes executable protocols', () => {
		const dangerous = link(' javascript:alert(1)')
		rehypeExternalLinks()({ type: 'root', children: [dangerous] })
		expect(dangerous).toMatchObject({ properties: { href: '#' } })
	})
})
