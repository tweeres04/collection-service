module.exports = {
	env: {
		browser: true,
		es6: true,
		node: true,
	},
	extends: 'react-app',
	globals: {
		Atomics: 'readonly',
		SharedArrayBuffer: 'readonly',
	},
	parserOptions: {
		ecmaVersion: 2020,
		sourceType: 'module',
	},
	rules: {
		'no-console': 'warn',
	},
}
