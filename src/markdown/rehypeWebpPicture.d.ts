export interface RehypeWebpPictureOptions {
	/** Directory beside each source image that contains `<name>-<width>.webp` variants. */
	variantDirectory?: string
	/** Responsive image sizes expression. Defaults to `100vw`. */
	sizes?: string
}

export interface RehypeWebpPictureFile {
	filename?: string
	path?: string
	history?: string[]
}

export interface RehypeWebpPictureTree {
	children?: unknown[]
}

export type RehypeWebpPictureTransformer = (
	tree: RehypeWebpPictureTree,
	file?: RehypeWebpPictureFile
) => void

export function rehypeWebpPicture(
	options?: RehypeWebpPictureOptions
): RehypeWebpPictureTransformer
