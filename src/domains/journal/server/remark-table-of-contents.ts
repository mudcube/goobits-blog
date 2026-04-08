import * as jsModule from './remark-table-of-contents.js'

const remarkTableOfContentsImpl = jsModule.remarkTableOfContents as () => unknown

export const remarkTableOfContents: typeof remarkTableOfContentsImpl = remarkTableOfContentsImpl
