const fs = require('fs')
const path = require('path')
const prettierOptions = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '.prettierrc'), 'utf8')
)

module.exports = {
  parser: 'babel-eslint',
  extends: ['prettier', 'prettier/react'],
  plugins: ['prettier'],
  env: {
    jest: true,
    browser: true,
    node: true,
    es6: true
  },
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  rules: {
    'prettier/prettier': ['error', prettierOptions]
  }
}
