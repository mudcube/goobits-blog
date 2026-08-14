import { describe, expect, it } from 'vitest'

import { remarkTableOfContents } from '../../src/markdown/remarkTableOfContents.js'

type MdRoot = Parameters<ReturnType<typeof remarkTableOfContents>>[0]

describe('remarkTableOfContents', () => {
	it('collects complete inline heading text and preserves existing heading data', () => {
		const tree: MdRoot = {
			children: [
				{ type: 'heading', depth: 2, children: [{ type: 'text', value: 'TOC' }] },
				{
					type: 'heading',
					depth: 2,
					children: [
						{ type: 'text', value: 'Line-breaks in ' },
						{ type: 'inlineCode', value: '<canvas>' }
					],
					data: { custom: 'keep', hProperties: { className: 'section' } }
				},
				{
					type: 'heading',
					depth: 3,
					children: [
						{ type: 'text', value: 'Using ' },
						{ type: 'emphasis', children: [{ type: 'text', value: 'nested emphasis' }] }
					]
				}
			]
		}

		remarkTableOfContents()(tree)

		expect(tree.children[0]).toMatchObject({
			type: 'heading',
			children: [{ value: 'Table of Contents' }]
		})
		expect(tree.children[1]).toMatchObject({
			type: 'list',
			children: [{
				children: [{ children: [{ url: '#line-breaks-in-canvas', children: [{ value: 'Line-breaks in <canvas>' }] }] }]
			}]
		})
		expect(tree.children[2]).toMatchObject({
			data: {
				custom: 'keep',
				hProperties: { className: 'section', id: 'line-breaks-in-canvas' }
			}
		})
		expect(tree.children[3]).toMatchObject({
			data: { hProperties: { id: 'using-nested-emphasis' } }
		})
	})

	it('deduplicates IDs derived from formatted headings', () => {
		const tree: MdRoot = {
			children: [
				{ type: 'heading', depth: 2, children: [{ type: 'text', value: 'TOC:6' }] },
				{ type: 'heading', depth: 2, children: [{ type: 'text', value: 'API ' }, { type: 'inlineCode', value: 'Guide' }] },
				{ type: 'heading', depth: 2, children: [{ type: 'strong', children: [{ type: 'text', value: 'API Guide' }] }] }
			]
		}

		remarkTableOfContents()(tree)

		expect(tree.children[2]).toMatchObject({ data: { hProperties: { id: 'api-guide' } } })
		expect(tree.children[3]).toMatchObject({ data: { hProperties: { id: 'api-guide-2' } } })
	})
})
