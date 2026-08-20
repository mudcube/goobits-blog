import { describe, expect, it } from 'vitest'

import { resolveMarkdownUrl, resolveMarkdownUrls } from '../../src/markdown/resolveMarkdownUrls.js'

describe('resolveMarkdownUrl', () => {
	it('resolves relative paths against root-relative and absolute post URLs', () => {
		expect(resolveMarkdownUrl('../shared.png?size=2#preview', '/journal/2024/07/post/')).toBe(
			'/journal/2024/07/shared.png?size=2#preview'
		)
		expect(resolveMarkdownUrl('images/hero.jpg', 'https://example.com/journal/post')).toBe(
			'https://example.com/journal/post/images/hero.jpg'
		)
	})

	it.each([
		'/root.png',
		'#section',
		'https://example.com/image.png',
		'mailto:hello@example.com',
		'//cdn.example.com/a.png'
	])('preserves non-relative destination %s', (value) => {
		expect(resolveMarkdownUrl(value, '/journal/post/')).toBe(value)
	})
})

describe('resolveMarkdownUrls', () => {
	it('rebases inline, nested, reference, and HTML destinations without reformatting Markdown', () => {
		const markdown = [
			'[![Preview](images/preview.png)](images/full.png "Full")',
			'[Download](<files/my file.zip>)',
			'[manual]: ../manual.pdf "Manual"',
			'<video poster="media/poster.jpg"><source src=\'media/movie.mp4\'></video>'
		].join('\n')

		expect(resolveMarkdownUrls(markdown, 'https://example.com/journal/2024/post/')).toBe(
			[
				'[![Preview](https://example.com/journal/2024/post/images/preview.png)](https://example.com/journal/2024/post/images/full.png "Full")',
				'[Download](<https://example.com/journal/2024/post/files/my%20file.zip>)',
				'[manual]: https://example.com/journal/2024/manual.pdf "Manual"',
				'<video poster="https://example.com/journal/2024/post/media/poster.jpg"><source src=\'https://example.com/journal/2024/post/media/movie.mp4\'></video>'
			].join('\n')
		)
	})

	it('leaves fenced, indented, and inline code untouched', () => {
		const markdown = [
			'`![inline](images/inline.png)` and ![real](images/real.png)',
			'```md',
			'![fenced](images/fenced.png)',
			'```',
			'    ![indented](images/indented.png)'
		].join('\n')
		const resolved = resolveMarkdownUrls(markdown, '/journal/post/')

		expect(resolved).toContain(
			'`![inline](images/inline.png)` and ![real](/journal/post/images/real.png)'
		)
		expect(resolved).toContain('![fenced](images/fenced.png)')
		expect(resolved).toContain('![indented](images/indented.png)')
	})
})
