type MdInline = {
	type: string
	value?: string
	alt?: string
	children?: MdInline[]
}
type MdHeading = {
	type: 'heading'
	depth: number
	children: MdInline[]
	data?: {
		hProperties?: { id?: string; [key: string]: unknown }
		[key: string]: unknown
	}
}
type MdNode = MdHeading | { type: string; [key: string]: unknown }
type MdRoot = { children: MdNode[] }

export function remarkTableOfContents(): (tree: MdRoot) => MdRoot
