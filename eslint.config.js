import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    eslint.configs.recommended,
    tseslint.configs.recommended,
    {
      languageOptions: {
        ecmaVersion: 6,
        sourceType: 'module',
      },
      rules: {
        indent: [
          'error',
          2,
          {
            SwitchCase: 1,
            VariableDeclarator: 2,
            MemberExpression: 2,

            FunctionDeclaration: {
              body: 1,
              parameters: 2,
            },

            FunctionExpression: {
              body: 1,
              parameters: 2,
            },

            CallExpression: {
              arguments: 2,
            },

            ArrayExpression: 1,
            ObjectExpression: 1,
          }
        ],
        'linebreak-style': ['error', 'unix'],
        quotes: ['error', 'single'],
        semi: ['error', 'always'],
      },
    }
);
