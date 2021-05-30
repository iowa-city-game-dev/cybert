module.exports = {
  'env': {
    'browser': false,
    'es6': true
  },
  'extends': [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  'parser': '@typescript-eslint/parser',
  'parserOptions': {
    'ecmaVersion': 6,
    'sourceType': 'module'
  },
  'plugins': [
    '@typescript-eslint'
  ],
  'rules': {
    'indent': [
      'error',
      2,
      {
        'SwitchCase': 1,
        'VariableDeclarator': 2,
        'MemberExpression': 2,
        'FunctionDeclaration': {
          'body': 1,
          'parameters': 2
        },
        'FunctionExpression': {
          'body': 1,
          'parameters': 2
        },
        'CallExpression': {
          'arguments': 2
        },
        'ArrayExpression': 1,
        'ObjectExpression': 1
      }
    ],
    'linebreak-style': [
      'error',
      'unix'
    ],
    'quotes': [
      'error',
      'single'
    ],
    'semi': [
      'error',
      'always'
    ]
  }
};
