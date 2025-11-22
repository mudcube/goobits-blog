# @goobits/blog

[![npm version](https://img.shields.io/npm/v/@goobits/blog.svg)](https://npmjs.com/package/@goobits/blog)

Markdown-based blog framework with flexible i18n support and content categorization for Svelte 5.

## 🔒 Security Notice

This package processes user-generated markdown content. Always sanitize markdown on the server-side before rendering. Do not trust user input.

## Features

- Content in `src/content/Blog/{year}/{month}/`
- Frontmatter for metadata (title, date, categories, tags)
- Framework-agnostic i18n support
- RSS feed generation
- Category and tag filtering
- Pagination and search
- Responsive layouts

## Installation

```bash
npm install @goobits/blog
```

## Quick Start

### 1. Configure Your Blog

Create a configuration file at `src/lib/blog-config.js`:

```js
export const blogConfig = {
  // Basic Information
  name: 'My Blog',
  description: 'Welcome to my blog',
  uri: '/blog',
  
  // Customize settings as needed
  theme: {
    colors: {
      primary: '#3b82f6',
    }
  }
}

// Define blog post files location
export function getBlogPostFiles() {
  return import.meta.glob('/src/content/Blog/**/*.md')
}
```

### 2. Initialize the Configuration

```js
// src/app.js
import { initBlogConfig } from '@goobits/blog/config'
import { blogConfig, getBlogPostFiles } from '$lib/blog-config.js'

initBlogConfig(blogConfig, {
  getBlogPostFiles
})
```

### 3. Create Blog Routes

Create the following route structure in your SvelteKit project:

```
src/routes/blog/
├── +page.server.js    # Load blog posts list
├── +page.svelte       # Blog index page
├── [...slug]/
│   ├── +page.server.js  # Load individual post/category/tag
│   └── +page.svelte     # Post display page
└── rss.xml/
    └── +server.js     # RSS feed endpoint
```

Use the route handlers from `@goobits/blog/handlers` to load blog data in your server files.

### 4. Use Components

```svelte
<script>
  import { PostList, Sidebar } from '@goobits/blog/ui'
  import { defaultMessages } from '@goobits/blog/config'
  
  let { posts, categories, tags } = $props()
</script>

<div class="blog-layout">
  <PostList {posts} />
  <Sidebar {categories} {tags} />
</div>
```

## Internationalization (i18n)

The blog package supports full internationalization through multiple integration methods:

### 1. Component-level Translation

All components accept a `messages` prop for direct translation override:

```svelte
<script>
  import { BlogCard } from '@goobits/blog'
  
  // Custom translations
  const messages = {
    readMore: 'Leer más',
    author: 'Autor',
    tags: 'Etiquetas'
  }
</script>

<BlogCard post={post} {messages} />
```

### 2. Server Integration

For full i18n with automatic language detection and routing:

```js
// hooks.server.js
import { handleBlogI18n } from '@goobits/blog/i18n'

export async function handle({ event, resolve }) {
  // Add language info to event.locals
  await handleBlogI18n(event)
  
  // Continue with request handling
  return await resolve(event)
}
```

### 3. Page Integration

Enhance blog pages with i18n data:

```js
// blog/+page.server.js
import { loadWithBlogI18n } from '@goobits/blog/i18n'

export const load = async (event) => {
  return await loadWithBlogI18n(event, async () => {
    // Your original blog data loading
    return { posts, categories, tags }
  })
}
```

### 4. Paraglide Integration

For seamless integration with Paraglide (recommended):

```js
import { createMessageGetter } from '@goobits/blog/i18n'
import * as m from '$paraglide/messages'

// Map blog message keys to Paraglide translations
const getMessage = createMessageGetter({
  readMore: m.readMore,
  author: m.author,
  tags: m.tags
})
```

## Components

- `BlogRouter` - Main router component
- `BlogLayout` - Blog layout wrapper
- `BlogListPage` - Blog index/archive page
- `BlogPostPage` - Individual post page
- `BlogCard` - Post preview card
- `BlogSEO` - SEO meta tags for blog pages
- `PostList` - List of blog posts with layouts
- `Sidebar` - Blog sidebar with search/filters
- `TagCategoryList` - Tag and category display
- `SocialShare` - Social sharing buttons
- `Newsletter` - Newsletter subscription form
- `Breadcrumbs` - Navigation breadcrumbs
- `LanguageSwitcher` - Language selection for i18n

## Styling

Import component-specific SCSS files:

```js
import '@goobits/blog/ui/BlogCard.scss'
import '@goobits/blog/ui/Sidebar.scss'
```

## Configuration

Override defaults by passing options to `initBlogConfig`:

```js
initBlogConfig({
  // Basic info
  name: 'My Blog',
  description: 'Welcome to my blog',
  uri: '/blog',

  // Content settings (showing defaults)
  posts: {
    excerptLength: 160,        // characters
    relatedPostsCount: 3,
    readTime: {
      wordsPerMinute: 225
    }
  },

  // Theme (showing defaults)
  theme: {
    colors: {
      primary: '#f59e0b',
      secondary: '#22c55e'
    }
  },

  // i18n (disabled by default)
  i18n: {
    enabled: true,
    supportedLanguages: ['en', 'es', 'fr'],
    defaultLanguage: 'en'
  }
})
```

## Accessibility

Components include proper ARIA attributes, semantic HTML, and keyboard navigation support.

## License

MIT