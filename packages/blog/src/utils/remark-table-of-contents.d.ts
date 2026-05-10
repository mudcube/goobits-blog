type MdText = { type: 'text'; value: string }
type MdHeading = {
	type: 'heading'
	depth: number
	children: Array<MdText | { type: string; [key: string]: unknown }>
	data?: { hProperties?: { id?: string } }
}
type MdNode = MdHeading | { type: string; [key: string]: unknown }
type MdRoot = { children: MdNode[] }

export function remarkTableOfContents(): (tree: MdRoot) => MdRoot
