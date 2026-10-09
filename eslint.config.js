import js from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
    { ignores: ['dist'] },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        rules: {
            'dot-notation': 'error',
            'no-console': 'error',
            'no-nested-ternary': 'warn',
            'no-else-return': 'error',
            'prefer-const': 'error',
            'object-shorthand': 'error',
        },
    },
)
