import { afterAll, describe, expect, it } from 'vitest'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { rehypeWebpPicture, type RehypeWebpPictureOptions } from '../../src/markdown/rehypeWebpPicture.js'

interface ElementNode {
	type: 'element'
	tagName: string
	properties: Record<string, unknown>
	children: ElementNode[]
}

interface RootNode {
	type: 'root'
	children: ElementNode[]
}

const PNG = Buffer.from(
	'iVBORw0KGgoAAAANSUhEUgAAAAIAAAADCAIAAAA7HLUcAAAAD0lEQVR4nGP4z8DAwMAAAAYAAeIhvDMAAAAASUVORK5CYII=',
	'base64'
)
const WEBP = Buffer.from(
	'UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEALmk0mk0iIiIiIgBoSygABc6zbAAA',
	'base64'
)
const staticRoot = join(process.cwd(), 'static')
mkdirSync(staticRoot, { recursive: true })
const fixtureDirectory = mkdtempSync(join(staticRoot, 'rehype-webp-'))
const publicPrefix = fixtureDirectory.substring(staticRoot.length)
const markdownPath = join(fixtureDirectory, 'index.md')

function writeFixture(relativePath: string, contents = WEBP): void {
	const filePath = join(fixtureDirectory, relativePath)
	mkdirSync(join(filePath, '..'), { recursive: true })
	writeFileSync(filePath, contents)
}

function transform(
	src: string,
	options?: RehypeWebpPictureOptions,
	initialProperties: Record<string, unknown> = {}
): {
	tree: RootNode
	image: ElementNode
} {
	const image: ElementNode = {
		type: 'element',
		tagName: 'img',
		properties: { src, alt: 'Fixture', ...initialProperties },
		children: []
	}
	const tree: RootNode = { type: 'root', children: [ image ] }
	rehypeWebpPicture(options)(tree, { filename: markdownPath })
	return { tree, image }
}

writeFixture('images/photo.png', PNG)
writeFixture('images/generated/photo-640.webp')
writeFixture('images/generated/photo-320.webp')
writeFixture('images/generated/photo-invalid.webp')
writeFixture('images/legacy.jpg', PNG)
writeFixture('images/legacy.webp')
writeFixture('images/direct.webp')
writeFixture('images/generated/direct-320.webp')

afterAll(() => {
	rmSync(fixtureDirectory, { recursive: true, force: true })
})

describe('rehypeWebpPicture', () => {
	it('emits ordered generated variants and preserves the original fallback', () => {
		const sizes = '(max-width: 700px) 100vw, 700px'
		const { tree, image } = transform('images/photo.png', { sizes })
		const picture = tree.children[0]

		expect(picture).toMatchObject({
			tagName: 'picture',
			children: [ {
				tagName: 'source',
				properties: {
					type: 'image/webp',
					sizes,
					srcSet: `${publicPrefix}/images/generated/photo-320.webp 320w, ${publicPrefix}/images/generated/photo-640.webp 640w`
				}
			}, image ]
		})
		expect(image.properties).toMatchObject({
			src: 'images/photo.png',
			width: 2,
			height: 3,
			loading: 'lazy',
			decoding: 'async'
		})
	})

	it('keeps the same-name WebP fallback when no generated variants exist', () => {
		const { tree } = transform('images/legacy.jpg')
		expect(tree.children[0]).toMatchObject({ tagName: 'picture' })
		expect(tree.children[0]?.children[0]).toMatchObject({
			tagName: 'source',
			properties: {
				type: 'image/webp',
				srcSet: `${publicPrefix}/images/legacy.webp`
			}
		})
	})

	it('reads direct WebP dimensions and uses its generated variants', () => {
		const { tree, image } = transform('images/direct.webp?cache=1')
		expect(tree.children[0]).toMatchObject({ tagName: 'picture' })
		expect(tree.children[0]?.children[0]).toMatchObject({
			properties: {
				srcSet: `${publicPrefix}/images/generated/direct-320.webp 320w`,
				sizes: '100vw'
			}
		})
		expect(image.properties).toMatchObject({
			src: 'images/direct.webp?cache=1',
			width: 1,
			height: 1
		})
	})

	it('leaves missing local images intact and fails soft', () => {
		const { tree, image } = transform('images/missing.jpg')
		expect(tree.children).toEqual([ image ])
		expect(image.properties).toMatchObject({ loading: 'lazy', decoding: 'async' })
		expect(image.properties).not.toHaveProperty('width')
	})

	it('applies loading policy before skipping external and data sources', () => {
		for (const src of [ 'https://images.example/photo.jpg', 'data:image/png;base64,abc' ]) {
			const { tree, image } = transform(src)
			expect(tree.children).toEqual([ image ])
			expect(image.properties).toMatchObject({ loading: 'lazy', decoding: 'async' })
		}
	})

	it('preserves explicitly configured loading and dimensions', () => {
		const { image } = transform('images/photo.png', undefined, {
			loading: 'eager',
			width: 200,
			height: 300
		})
		expect(image.properties).toMatchObject({
			loading: 'eager',
			width: 200,
			height: 300
		})
	})
})
