import { afterAll, describe, expect, it, vi } from 'vitest'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import {
	rehypeWebpPicture,
	type RehypeWebpPictureOptions
} from '../../src/markdown/rehypeWebpPicture.js'

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

const staticRoot = join(process.cwd(), 'static')
mkdirSync(staticRoot, { recursive: true })
const fixtureDirectory = mkdtempSync(join(staticRoot, 'rehype-webp-'))
const publicPrefix = fixtureDirectory.substring(staticRoot.length)
const markdownPath = join(fixtureDirectory, 'index.md')

function writeFixture(relativePath: string, contents = 'fixture'): void {
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
	const tree: RootNode = { type: 'root', children: [image] }
	rehypeWebpPicture(options)(tree, { filename: markdownPath })
	return { tree, image }
}

writeFixture('images/photo.png')
writeFixture('images/generated/photo-640.webp')
writeFixture('images/generated/photo-320.webp')
writeFixture('images/generated/photo-invalid.webp')
writeFixture('images/legacy.jpg')
writeFixture('images/legacy.webp')
writeFixture('images/direct.webp')
writeFixture('images/generated/direct-320.webp')

afterAll(() => {
	rmSync(fixtureDirectory, { recursive: true, force: true })
})

describe('rehypeWebpPicture', () => {
	it('emits ordered generated variants and preserves the original fallback', () => {
		const sizes = '(max-width: 700px) 100vw, 700px'
		const resolveImageDimensions = vi.fn(() => ({ width: 2, height: 3 }))
		const { tree, image } = transform('images/photo.png', {
			sizes,
			resolveImageDimensions
		})
		const picture = tree.children[0]

		expect(picture).toMatchObject({
			tagName: 'picture',
			children: [
				{
					tagName: 'source',
					properties: {
						type: 'image/webp',
						sizes,
						srcSet: `${publicPrefix}/images/generated/photo-320.webp 320w, ${publicPrefix}/images/generated/photo-640.webp 640w`
					}
				},
				image
			]
		})
		expect(image.properties).toMatchObject({
			src: 'images/photo.png',
			width: 2,
			height: 3,
			loading: 'lazy',
			decoding: 'async'
		})
		expect(resolveImageDimensions).toHaveBeenCalledWith(join(fixtureDirectory, 'images/photo.png'))
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

	it('uses resolved direct WebP dimensions and generated variants', () => {
		const { tree, image } = transform('images/direct.webp?cache=1', {
			resolveImageDimensions: () => ({ width: 1, height: 1 })
		})
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
		expect(tree.children).toEqual([image])
		expect(image.properties).toMatchObject({ loading: 'lazy', decoding: 'async' })
		expect(image.properties).not.toHaveProperty('width')
	})

	it('omits inferred dimensions when no host resolver is configured', () => {
		const { image } = transform('images/photo.png')
		expect(image.properties).not.toHaveProperty('width')
		expect(image.properties).not.toHaveProperty('height')
	})

	it('fails soft when the host dimension resolver throws or returns invalid values', () => {
		for (const resolveImageDimensions of [
			() => {
				throw new Error('metadata unavailable')
			},
			() => ({ width: 0, height: 3 })
		]) {
			const { image } = transform('images/photo.png', { resolveImageDimensions })
			expect(image.properties).not.toHaveProperty('width')
			expect(image.properties).not.toHaveProperty('height')
		}
	})

	it('applies loading policy before skipping external and data sources', () => {
		for (const src of ['https://images.example/photo.jpg', 'data:image/png;base64,abc']) {
			const { tree, image } = transform(src)
			expect(tree.children).toEqual([image])
			expect(image.properties).toMatchObject({ loading: 'lazy', decoding: 'async' })
		}
	})

	it('preserves explicitly configured loading and dimensions', () => {
		const resolveImageDimensions = vi.fn(() => ({ width: 2, height: 3 }))
		const { image } = transform(
			'images/photo.png',
			{ resolveImageDimensions },
			{
				loading: 'eager',
				width: 200,
				height: 300
			}
		)
		expect(image.properties).toMatchObject({
			loading: 'eager',
			width: 200,
			height: 300
		})
		expect(resolveImageDimensions).not.toHaveBeenCalled()
	})
})
