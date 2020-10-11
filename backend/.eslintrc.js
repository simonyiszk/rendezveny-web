/* eslint-disable line-comment-position,no-magic-numbers */
module.exports = {
	parser: '@typescript-eslint/parser',
	parserOptions: {
		project: 'tsconfig.eslint.json',
		sourceType: 'module'
	},
	plugins: ['@typescript-eslint/eslint-plugin'],
	extends: [
		'plugin:@typescript-eslint/eslint-recommended',
		'plugin:@typescript-eslint/recommended',
		'prettier',
		'prettier/@typescript-eslint'
	],
	root: true,
	env: {
		node: true,
		jest: true
	},
	rules: {
		// JS practices
		curly: ['error', 'multi-line'],
		'dot-location': ['error', 'property'],
		'dot-notation': 'error',
		eqeqeq: ['error', 'always'],
		'grouped-accessor-pairs': ['error', 'getBeforeSet'],
		'max-classes-per-file': ['error', 1],
		'no-alert': 'error',
		'no-caller': 'error',
		'no-constructor-return': 'error',
		// 'no-empty-function': 'error',
		'no-eq-null': 'error',
		'no-eval': 'error',
		'no-extend-native': 'error',
		'no-extra-bind': 'error',
		'no-extra-label': 'error',
		'no-floating-decimal': 'error',
		'no-implicit-coercion': 'error',
		'no-implied-eval': 'error',
		'no-invalid-this': 'error',
		'no-iterator': 'error',
		'no-labels': 'error',
		'no-lone-blocks': 'error',
		'no-loop-func': 'error',
		'no-magic-numbers': ['error', { ignore: [-1, 0, 1, 2] }],
		'no-multi-spaces': 'error',
		'no-multi-str': 'error',
		'no-new': 'error',
		'no-new-func': 'error',
		'no-new-wrappers': 'error',
		'no-octal-escape': 'error',
		'no-param-reassign': 'error',
		'no-proto': 'error',
		'no-return-assign': 'error',
		'no-return-await': 'error',
		'no-script-url': 'error',
		'no-self-compare': 'error',
		'no-sequences': 'error',
		'no-throw-literal': 'error',
		'no-unmodified-loop-condition': 'error',
		'no-void': 'error',
		'prefer-named-capture-group': 'error',
		'prefer-promise-reject-errors': ['error', { allowEmptyReject: true }],
		'prefer-regex-literals': 'error',
		radix: ['error', 'as-needed'],
		'require-unicode-regexp': 'error',
		'wrap-iife': ['error', 'inside'],
		yoda: ['error', 'never', { exceptRange: true }],

		'no-label-var': 'error',
		'no-shadow': 'error',
		'no-undef-init': 'error',
		'no-undefined': 'error',

		// ES2015 practices
		'arrow-body-style': ['error', 'as-needed'],
		'arrow-parens': ['error', 'as-needed', { requireForBlockBody: true }],
		'arrow-spacing': ['error', { before: true, after: true }],
		'generator-star-spacing': ['error', { before: true, after: false }],
		'no-confusing-arrow': 'error',
		'no-duplicate-imports': ['error', { includeExports: true }],
		'no-useless-computed-key': 'error',
		'no-var': 'error',
		'object-shorthand': ['error', 'consistent-as-needed'],
		'prefer-arrow-callback': 'error',
		'prefer-const': 'error',
		'prefer-destructuring': 'error',
		'prefer-numeric-literals': 'error',
		'prefer-rest-params': 'error',
		'prefer-spread': 'error',
		'prefer-template': 'error',
		'rest-spread-spacing': ['error', 'never'],
		'symbol-description': 'error',
		'template-curly-spacing': ['error', 'never'],
		'yield-star-spacing': ['error', 'before'],


		// TS practices
		'@typescript-eslint/array-type': 'error',
		'@typescript-eslint/ban-ts-comment': 'error',
		'@typescript-eslint/explicit-member-accessibility': ['error', { accessibility: 'explicit' }],
		'@typescript-eslint/explicit-module-boundary-types': 'error',
		'@typescript-eslint/member-ordering': ['error', { default: [
			// Index signature
			'signature',

			// Static
			'public-static-field',
			'protected-static-field',
			'private-static-field',
			'public-static-method',
			'protected-static-method',
			'private-static-method',

			// Fields
			'public-instance-field',
			'protected-instance-field',
			'private-instance-field',
			'public-abstract-field',
			'protected-abstract-field',
			'private-abstract-field',

			// Constructors
			'public-constructor',
			'protected-constructor',
			'private-constructor',

			// Methods
			'public-instance-method',
			'protected-instance-method',
			'public-abstract-method',
			'protected-abstract-method',
			'private-instance-method',
			'private-abstract-method'
		] }],
		'@typescript-eslint/naming-convention': ['error',
			{ selector: 'default', format: ['camelCase'] },
			{ selector: 'variableLike', format: ['camelCase', 'UPPER_CASE'] },
			{ selector: 'parameter', format: ['camelCase'], leadingUnderscore: 'allow' },
			{ selector: 'memberLike', format: ['camelCase'] },
			{ selector: 'property', modifiers: ['private'], format: ['PascalCase'], prefix: ['m'] },
			{ selector: 'property', modifiers: ['static', 'readonly'], format: ['UPPER_CASE'] },
			{ selector: 'property', modifiers: ['private', 'static', 'readonly'], format: ['UPPER_CASE'] },
			{ selector: 'enumMember', format: ['UPPER_CASE'] },
			{ selector: 'typeLike', format: ['PascalCase'] },
			{ selector: 'class', modifiers: ['abstract'], format: ['PascalCase'], prefix: ['Base'] }],
		'@typescript-eslint/no-dynamic-delete': 'error',
		'@typescript-eslint/no-extra-non-null-assertion': ['error'],
		'@typescript-eslint/no-floating-promises': 'error',
		'@typescript-eslint/no-implied-eval': 'error',
		'@typescript-eslint/no-non-null-asserted-optional-chain': 'error',
		'@typescript-eslint/no-require-imports': 'error',
		'@typescript-eslint/no-throw-literal': 'error',
		'@typescript-eslint/no-unnecessary-boolean-literal-compare': 'error',
		'@typescript-eslint/no-unnecessary-condition': 'error',
		'@typescript-eslint/no-unnecessary-qualifier': 'error',
		'@typescript-eslint/no-unnecessary-type-arguments': 'error',
		'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
		'@typescript-eslint/no-unused-expressions': 'error',
		'@typescript-eslint/prefer-as-const': 'error',
		'@typescript-eslint/prefer-for-of': 'error',
		'@typescript-eslint/prefer-nullish-coalescing': 'error',
		'@typescript-eslint/prefer-optional-chain': 'error',
		'@typescript-eslint/prefer-readonly': 'error',
		'@typescript-eslint/promise-function-async': 'error',
		'@typescript-eslint/require-array-sort-compare': 'error',
		'@typescript-eslint/restrict-plus-operands': ['error', { checkCompoundAssignments: true }],
		'@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
		'@typescript-eslint/strict-boolean-expressions': 'error',
		'@typescript-eslint/switch-exhaustiveness-check': 'error',
		'@typescript-eslint/unified-signatures': 'error',

		// Formatting
		'array-bracket-newline': ['error', 'consistent'],
		'array-bracket-spacing': ['error', 'never'],
		'array-element-newline': ['error', 'consistent'],
		'block-spacing': 'error',
		'brace-style': ['error', 'stroustrup'],
		'capitalized-comments': ['error'],
		'comma-dangle': ['error', 'never'],
		'comma-spacing': 'error',
		'comma-style': ['error', 'last'],
		'computed-property-spacing': ['error', 'never'],
		'func-call-spacing': ['error', 'never'],
		'func-style': ['error', 'declaration', { allowArrowFunctions: true }],
		'function-call-argument-newline': ['error', 'consistent'],
		'function-paren-newline': ['error', 'consistent'],

		/*
		 *'indent': ['error', 'tab', {
		 *SwitchCase: 1
		 *}],
		 */
		'jsx-quotes': ['error', 'prefer-double'],
		'key-spacing': 'error',
		'keyword-spacing': ['error', { overrides: {
				if: { after: false },
				for: { after: false },
				while: { after: false },
				switch: { after: false }
			} }],
		'line-comment-position': ['error', { position: 'beside' }],
		'lines-around-comment': ['error', { beforeBlockComment: true, allowBlockStart: true }],
		'lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: true }],
		'max-depth': ['error', 4],
		'max-len': ['error', {
			code: 120,
			tabWidth: 4,
			comments: 120,
			ignoreComments: true,
			ignoreUrls: true,
			ignoreTemplateLiterals: true,
			ignoreRegExpLiterals: true
		}],
		'max-statements-per-line': ['error', { max: 1 }],
		'multiline-comment-style': ['error', 'starred-block'],
		'multiline-ternary': ['error', 'always-multiline'],
		'new-parens': 'error',
		'newline-per-chained-call': ['error', { ignoreChainWithDepth: 4 }],
		'no-bitwise': 'error',
		'no-continue': 'error',
		'no-mixed-operators': 'error',
		'no-mixed-spaces-and-tabs': ['error', 'smart-tabs'],
		'no-multi-assign': 'error',
		'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 1 }],
		'no-nested-ternary': 'error',
		'no-new-object': 'error',
		'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
		// 'no-trailing-spaces': ['error', { skipBlankLines: true, ignoreComments: true }],
		'no-unneeded-ternary': 'error',
		'no-whitespace-before-property': 'error',
		'nonblock-statement-body-position': ['error', 'beside'],
		'object-curly-newline': ['error', { consistent: true }],
		'object-curly-spacing': ['error', 'always'],
		'object-property-newline': ['error', { allowAllPropertiesOnSameLine: true }],
		'one-var': ['error', 'never'],
		'operator-linebreak': ['error', 'before'],
		'padded-blocks': ['error', 'never'],
		'prefer-exponentiation-operator': 'error',
		'prefer-object-spread': 'error',
		'quote-props': ['error', 'as-needed'],
		quotes: ['error', 'single'],
		semi: ['error', 'always'],
		'semi-spacing': 'error',
		'semi-style': ['error', 'last'],
		'space-before-blocks': 'error',
		'space-before-function-paren': ['error', 'never'],
		'space-in-parens': ['error', 'never'],
		'space-infix-ops': 'error',
		'space-unary-ops': 'error',
		'spaced-comment': ['error', 'always'],
		'switch-colon-spacing': 'error',
		'template-tag-spacing': ['error', 'never']
	}
};
