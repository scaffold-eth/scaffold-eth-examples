module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
    'unicorn',
    'json',
  ],
  extends: 'eslint:recommended',
  parserOptions: {
    'sourceType': 'module',
  },
  globals: {
    Promise: true,
    Buffer: true,
    fetch: true,
    require: true,
    process: true,
    module: true,
    setTimeout: true,
    __dirname: true,
    u32: true,
    u8: true,
  },
  rules: {
    'indent': ['error', 2],
    'space-before-function-paren': ['error', 'never'],
    semi: ['error', 'never'],
    'no-underscore-dangle': 0,
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    // trailing comma
    'comma-dangle': ['error', 'always-multiline'],
    quotes: ['error', 'single', { 'avoidEscape': true, 'allowTemplateLiterals': true }],
    camelcase: ['error', { 'properties': 'always' }],
    'unicorn/filename-case': ['error', { 'case': 'kebabCase' }],
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        '@typescript-eslint/no-unused-vars': ['error', { args: 'none' }],
      },
    },
    {
      files: ['*.json'],
      rules: {
        'unicorn/filename-case': ['error', { 'case': 'pascalCase' }],
      },
    },
  ],
}