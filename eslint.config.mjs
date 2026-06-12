import nextConfig from 'eslint-config-next'

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...nextConfig,
  {
    name: 'squl/custom',
    files: ['**/*.{js,mjs,ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      'react/no-unescaped-entities': 'error',
    },
  },
]
