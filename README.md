# @goobits/blog

Markdown-based blog framework with flexible i18n support and content categorization.

## TL;DR

- Install and call `initBlogConfig` in `src/app.js` with your content glob and settings.
- Copy route templates from `node_modules/@goobits/blog/templates/` into your SvelteKit routes.
- Use `PostList`, `Sidebar`, and other components from `@goobits/blog/ui`.
- Pass a `messages` prop or wire `handleBlogI18n` for internationalization.

## Security Notice

This package processes user-generated markdown content. Always sanitize markdown on the server-side before rendering. Do not trust user input.

## Features

- Content in `src/content/Blog/{year}/{month}/`
- Frontmatter for metadata (title, date, categories, tags)
- Framework-agnostic i18n support
- RSS feed generation
- Category and tag filtering
- Pagination and search
- Responsive layouts

## Usage

```bash
npm install @goobits/blog
```

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

Copy templates from `node_modules/@goobits/blog/templates/` to your routes directory:

```
src/routes/
└── blog/
    ├── +page.server.js  # Blog index
    ├── +page.svelte     # Blog index display
    ├── [...slug]/       # Blog posts, categories, tags
    └── rss.xml/         # RSS feed
```

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
- `BlogListPage` - Blog index/archive page
- `BlogPostPage` - Individual post page
- `BlogCard` - Post preview card
- `PostList` - List of blog posts with layouts
- `Sidebar` - Blog sidebar with search/filters
- `TagCategoryList` - Tag and category display
- `SocialShare` - Social sharing buttons
- `Newsletter` - Newsletter subscription form
- `Breadcrumbs` - Navigation breadcrumbs

## Styling

Import component-specific SCSS files:

```js
import '@goobits/blog/ui/BlogCard.scss'
import '@goobits/blog/ui/Sidebar.scss'
```

## Configuration Options

The blog can be configured with many options:

```js
initBlogConfig({
  // Basic info
  name: 'My Blog',
  description: 'Welcome to my blog',
  uri: '/blog',
  
  // Content settings
  posts: {
    excerptLength: 200,
    relatedPostsCount: 5,
    readTime: {
      wordsPerMinute: 200
    }
  },
  
  // Theme
  theme: {
    colors: {
      primary: '#3b82f6',
      secondary: '#10b981'
    }
  },
  
  // i18n
  i18n: {
    enabled: true,
    supportedLanguages: ['en', 'es', 'fr']
  }
})
```

## Accessibility

Components include proper ARIA attributes, semantic HTML, and keyboard navigation support.

## License

MIT
