import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import svelte from 'eslint-plugin-svelte'
import globals from 'globals'

export default tseslint.config(
  js.configs.recommended,
  ...svelte.configs['flat/recommended'],
  {
    ignores: ['node_modules/**', 'dist/**', '.svelte-kit/**']
  },
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      }
    }
  },
  // TypeScript files with strict type checking
  {
    files: ['**/*.ts'],
    extends: [...tseslint.configs.strictTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname
      }
    },
    rules: {
      // ===== TYPESCRIPT STRICT RULES =====
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': ['error', { allowExpressions: true }],
      '@typescript-eslint/explicit-module-boundary-types': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/strict-boolean-expressions': ['error', {
        allowString: true,
        allowNumber: true,
        allowNullableObject: true,
        allowNullableBoolean: true,
        allowNullableString: true,
        allowNullableNumber: true
      }],
      '@typescript-eslint/restrict-template-expressions': ['error', {
        allowNumber: true,
        allowBoolean: true,
        allowNullish: false
      }],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      '@typescript-eslint/prefer-as-const': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/consistent-type-exports': 'error',

      // Disable base rules that conflict with TypeScript
      'no-unused-vars': 'off',
      'no-undef': 'off',
      'no-use-before-define': 'off',
      'no-shadow': 'off',
      'no-redeclare': 'off',
      'consistent-return': 'off',
      'require-await': 'off',
      'dot-notation': 'off',
      'no-invalid-this': 'off',

      // ===== STRICT CODE QUALITY RULES =====
      'eqeqeq': ['error', 'always'],
      'no-implicit-coercion': 'error',
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',
      'no-void': ['error', { allowAsStatement: true }],
      'no-with': 'error',
      'radix': 'error',
      'no-return-assign': ['error', 'always'],
      'no-sequences': 'error',
      'no-throw-literal': 'off',
      '@typescript-eslint/only-throw-error': 'error',
      'no-useless-concat': 'error',
      'no-useless-return': 'error',
      'prefer-promise-reject-errors': 'error',

      // ===== STRICT ERROR PREVENTION =====
      'no-constant-condition': 'error',
      'no-dupe-args': 'error',
      'no-dupe-keys': 'error',
      'no-duplicate-case': 'error',
      'no-empty': ['error', { allowEmptyCatch: false }],
      'no-ex-assign': 'error',
      'no-extra-boolean-cast': 'error',
      'no-func-assign': 'error',
      'no-inner-declarations': 'error',
      'no-irregular-whitespace': 'error',
      'no-obj-calls': 'error',
      'no-sparse-arrays': 'error',
      'no-unreachable': 'error',
      'no-unsafe-finally': 'error',
      'no-unsafe-negation': 'error',
      'use-isnan': 'error',
      'valid-typeof': 'error',

      // ===== STRICT BEST PRACTICES =====
      'array-callback-return': ['error', { allowImplicit: false }],
      'block-scoped-var': 'error',
      'curly': ['error', 'all'],
      'default-case': 'error',
      'default-case-last': 'error',
      '@typescript-eslint/dot-notation': 'error',
      'guard-for-in': 'error',
      'no-alert': 'error',
      'no-caller': 'error',
      'no-case-declarations': 'error',
      'no-constructor-return': 'error',
      'no-else-return': ['error', { allowElseIf: false }],
      'no-empty-function': 'off',
      '@typescript-eslint/no-empty-function': ['error', { allow: ['arrowFunctions'] }],
      'no-empty-pattern': 'error',
      'no-extend-native': 'error',
      'no-extra-bind': 'error',
      'no-extra-label': 'error',
      'no-fallthrough': 'error',
      'no-floating-decimal': 'error',
      'no-global-assign': 'error',
      'no-implicit-globals': 'error',
      'no-iterator': 'error',
      'no-labels': 'error',
      'no-lone-blocks': 'error',
      'no-loop-func': 'off',
      '@typescript-eslint/no-loop-func': 'error',
      'no-multi-str': 'error',
      'no-new': 'error',
      'no-new-wrappers': 'error',
      'no-octal': 'error',
      'no-octal-escape': 'error',
      'no-param-reassign': ['error', { props: false }],
      'no-proto': 'error',
      'no-self-assign': 'error',
      'no-self-compare': 'error',
      'no-unmodified-loop-condition': 'error',
      'no-unused-expressions': 'off',
      '@typescript-eslint/no-unused-expressions': ['error', { allowShortCircuit: true, allowTernary: true }],
      'no-unused-labels': 'error',
      'no-useless-call': 'error',
      'no-useless-catch': 'error',
      'no-useless-escape': 'error',
      '@typescript-eslint/require-await': 'error',
      'yoda': 'error',

      // ===== STRICT ES6+ RULES =====
      'arrow-body-style': ['error', 'as-needed'],
      'no-duplicate-imports': 'off',
      'no-useless-computed-key': 'error',
      'no-useless-constructor': 'off',
      '@typescript-eslint/no-useless-constructor': 'error',
      'no-useless-rename': 'error',
      'no-var': 'error',
      'object-shorthand': ['error', 'always'],
      'prefer-arrow-callback': ['error', { allowNamedFunctions: false }],
      'prefer-const': ['error', { destructuring: 'all' }],
      'prefer-destructuring': ['error', { array: false, object: true }],
      'prefer-rest-params': 'error',
      'prefer-spread': 'error',
      'prefer-template': 'error',
      'symbol-description': 'error',

      // ===== LOGGING - allowed for library =====
      'no-console': 'off'
    }
  },
  // Svelte files - without type-checked rules
  {
    files: ['**/*.svelte'],
    rules: {
      // Svelte-specific rules
      'svelte/no-navigation-without-resolve': 'off',
      'svelte/prefer-writable-derived': 'error',
      'svelte/prefer-svelte-reactivity': 'error',
      'svelte/no-at-html-tags': 'error',
      'svelte/no-reactive-functions': 'error',
      'svelte/no-reactive-literals': 'error',
      'svelte/no-useless-mustaches': 'error',
      'svelte/require-each-key': 'error',
      'svelte/require-event-dispatcher-types': 'error',
      'svelte/valid-each-key': 'error',
      // Strict JS rules for Svelte
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'eqeqeq': ['error', 'always'],
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'curly': ['error', 'all'],
      'no-var': 'error',
      'prefer-const': ['error', { destructuring: 'all' }],
      'prefer-template': 'error',
      'no-console': 'off'
    }
  },
  // Config files - relaxed rules
  {
    files: ['*.config.js', '*.config.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off'
    }
  }
)
