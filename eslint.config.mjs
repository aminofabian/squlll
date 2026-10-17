import nextConfig from 'eslint-config-next'

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...nextConfig,
  {
    name: 'squl/custom-typescript',
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    name: 'squl/custom-javascript',
    files: ['**/*.{js,mjs,jsx,tsx}'],
    rules: {
      'react/no-unescaped-entities': 'error',
    },
  },
]
