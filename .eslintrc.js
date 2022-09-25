module.exports = {
  env: {
    browser: true,
    es6: true
  },
  extends: [
    '@z3k/eslint-config-zk',
    'plugin:ava/recommended'
  ],
  plugins: [
    'ava'
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parserOptions: {
    ecmaVersion: 2018
  },
  rules: {
    'ava/no-skip-test': ['warn']
  }
}
