export interface BlogUiMessages {
	backToBlog: string
	copyLink: string
	copiedLink: string
	emailPlaceholder: string
	loadMore: string
	loading: string
	minuteRead: (minutes: number) => string
	noPosts: string
	readMore: string
	relatedPosts: string
	search: string
	searchPlaceholder: string
	share: string
	subscribe: string
	subscribed: string
	subscribeError: string
	untitledPost: string
}

export const defaultBlogUiMessages: BlogUiMessages = {
	backToBlog: 'Back to blog',
	copyLink: 'Copy link',
	copiedLink: 'Link copied',
	emailPlaceholder: 'Email address',
	loadMore: 'Load more',
	loading: 'Loading',
	minuteRead: minutes => `${ minutes } min read`,
	noPosts: 'No posts found',
	readMore: 'Read more',
	relatedPosts: 'Related posts',
	search: 'Search',
	searchPlaceholder: 'Search posts',
	share: 'Share',
	subscribe: 'Subscribe',
	subscribed: 'Subscribed',
	subscribeError: 'Unable to subscribe',
	untitledPost: 'Untitled post'
}

export type BlogUiMessagesInput = Partial<BlogUiMessages>

export function createBlogUiMessages(input: BlogUiMessagesInput = {}): BlogUiMessages {
	return { ...defaultBlogUiMessages, ...input }
}
