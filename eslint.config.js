import js from '@eslint/js'
import svelte from 'eslint-plugin-svelte'
import globals from 'globals'

export default [
  js.configs.recommended,
  ...svelte.configs['flat/recommended'],
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      }
    }
  },
  {
    ignores: ['node_modules/**', 'dist/**', '.svelte-kit/**']
  },
  {
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-console': 'off',
      // Library components don't use SvelteKit's resolve() - consumers handle routing
      'svelte/no-navigation-without-resolve': 'off',
      // Writable derived is a suggestion, not always applicable
      'svelte/prefer-writable-derived': 'warn',
      // SvelteURLSearchParams not needed for SSR-safe patterns
      'svelte/prefer-svelte-reactivity': 'warn'
    }
  }
]
