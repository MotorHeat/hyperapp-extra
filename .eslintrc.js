module.exports = {
  env: {
    browser: true,
    es2020: true
  },
  extends: [
    'standard'
  ],
  parserOptions: {
    ecmaVersion: 11,
    sourceType: 'module'
  },
  rules: {
    'no-return-assign': 0,
    'operator-linebreak': ['error', 'before'],
    'no-unused-vars': 1
  }
}
