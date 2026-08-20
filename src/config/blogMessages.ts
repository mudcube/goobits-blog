export interface BlogUiMessages {
	backToBlog: string
	blogPages: string
	blogTopics: string
	breadcrumbs: string
	categories: string
	closeGallery: string
	copyLink: string
	copiedLink: string
	email: string
	emailPlaceholder: string
	facebook: string
	galleryFrame: string
	galleryPosition: (current: number, total: number) => string
	imageGallery: string
	invalidEmail: string
	loadMore: string
	loading: string
	minuteRead: (minutes: number) => string
	moreItems: (count: number) => string
	newsletter: string
	nextImage: string
	nextPage: string
	noPosts: string
	pageStatus: (current: number, total: number) => string
	previousImage: string
	previousPage: string
	readMore: string
	relatedPosts: string
	search: string
	searchAndSort: string
	searchPlaceholder: string
	share: string
	sharingOptions: string
	sort: string
	sortNewest: string
	sortOldest: string
	sortTitle: string
	subscribe: string
	subscribed: string
	subscribeError: string
	tags: string
	untitledPost: string
	x: string
}

export const defaultBlogUiMessages: BlogUiMessages = {
	backToBlog: 'Back to blog',
	blogPages: 'Blog pages',
	blogTopics: 'Blog topics',
	breadcrumbs: 'Breadcrumbs',
	categories: 'Categories',
	closeGallery: 'Close gallery',
	copyLink: 'Copy link',
	copiedLink: 'Link copied',
	email: 'Email',
	emailPlaceholder: 'Email address',
	facebook: 'Facebook',
	galleryFrame: 'Gallery frame',
	galleryPosition: (current, total) => `${current} / ${total}`,
	imageGallery: 'Image gallery',
	invalidEmail: 'Enter a valid email address',
	loadMore: 'Load more',
	loading: 'Loading',
	minuteRead: (minutes) => `${minutes} min read`,
	moreItems: (count) => `${count} more`,
	newsletter: 'Newsletter',
	nextImage: 'Next image',
	nextPage: 'Next',
	noPosts: 'No posts found',
	pageStatus: (current, total) => `Page ${current} of ${total}`,
	previousImage: 'Previous image',
	previousPage: 'Previous',
	readMore: 'Read more',
	relatedPosts: 'Related posts',
	search: 'Search',
	searchAndSort: 'Search and sort posts',
	searchPlaceholder: 'Search posts',
	share: 'Share',
	sharingOptions: 'Sharing options',
	sort: 'Sort posts',
	sortNewest: 'Newest first',
	sortOldest: 'Oldest first',
	sortTitle: 'Title',
	subscribe: 'Subscribe',
	subscribed: 'Subscribed',
	subscribeError: 'Unable to subscribe',
	tags: 'Tags',
	untitledPost: 'Untitled post',
	x: 'X'
}

export type BlogUiMessagesInput = Partial<BlogUiMessages>

export function createBlogUiMessages(input: BlogUiMessagesInput = {}): BlogUiMessages {
	return { ...defaultBlogUiMessages, ...input }
}
