module.exports = {
	// 一个配置文件可以被基础配置中的已启用的规则继承。
	extends: ['prettier', 'plugin:react/recommended', 'plugin:@typescript-eslint/recommended'],
	// 为我们提供运行环境，一个环境定义了一组预定义的全局变量
	env: {
		browser: true,
		es6: true
	},
	// ESLint 默认使用Espree作为其解析器，你可以在配置文件中指定一个不同的解析器
	parser: '@typescript-eslint/parser',
	// 配置解析器支持的语法
	// parserOptions: {
	// 	ecmaFeatures: {
	// 		jsx: true
	// 	},
	// 	ecmaVersion: 2018,
	// 	sourceType: 'module'
	// },
	// ESLint 支持使用第三方插件。在使用插件之前，你必须使用 npm 安装它。
	// 在配置文件里配置插件时，可以使用 plugins 关键字来存放插件名字的列表。插件名称可以省略 eslint-plugin- 前缀。
	plugins: ['react', 'babel', '@typescript-eslint', 'react-hooks'],
	// https://github.com/typescript-eslint/typescript-eslint/issues/46#issuecomment-470486034
	overrides: [
		{
			files: ['*.ts', '*.tsx'],
			rules: {
				"@typescript-eslint/no-explicit-any":0,
				// 禁止使用@ts-ignore等
				'@typescript-eslint/ban-ts-comment': 0,
				// 禁止使用'!'
				'@typescript-eslint/no-non-null-assertion': 0,
				'no-unused-expressions': 0,
				'@typescript-eslint/no-unused-expressions': 0,
				// 函数必须有返回类型
				'@typescript-eslint/explicit-module-boundary-types': 0,
				// 未使用的变量，建议开启
				'@typescript-eslint/no-unused-vars': 0,
				'@typescript-eslint/ban-types': 0
			}
		}
	],
	// https://github.com/yannickcr/eslint-plugin-react#configuration
	settings: {
		react: {
			version: '16.9'
		},
		polyfills: ['Promise', 'URL']
	},
	// ESLint 附带有大量的规则。你可以使用注释或配置文件修改你项目中要使用的规则。要改变一个规则设置，你必须将规则 ID 设置为下列值之一：
	// "off" 或 0 - 关闭规则
	// "warn" 或 1 - 开启规则，使用警告级别的错误：warn (不会导致程序退出)
	// "error" 或 2 - 开启规则，使用错误级别的错误：error (当被触发的时候，程序会退出)
	rules: {
		indent: 0,
		'default-case': 0,
		'eol-last': 0,
		'no-unused-vars': 0,
		'no-console': 0,
		'no-plusplus': 0,
		'no-script-url': 0,
		'prefer-rest-params': 0,
		// 是否更适合用const，建议开启
		'prefer-const': 0,
		'compat/compat': 0,
		'react/no-access-state-in-setstate': 0,
		'react/destructuring-assignment': 0,
		'react/no-multi-comp': 0,
		'react/no-array-index-key': 0,
		'react/jsx-one-expression-per-line': 0,
		'react/prop-types': 0,
		'react/forbid-prop-types': 0,
		'react/jsx-indent': 0,
		'react/jsx-wrap-multilines': ['error', {declaration: false, assignment: false}],
		'react/jsx-filename-extension': 0,
		'react/state-in-constructor': 0,
		'react/jsx-props-no-spreading': 0,
		'react/require-default-props': 0,
		'react/sort-comp': 0,
		'react/display-name': 0,
		'react/static-property-placement': 0,
		'react/no-find-dom-node': 0,
		'react/no-unused-prop-types': 0,
		'react/default-props-match-prop-types': 0,
		'react-hooks/rules-of-hooks': 2, // Checks rules of Hooks
		'import/no-extraneous-dependencies': 0,
		'import/extensions': 0,
		'import/no-cycle': 0,

		// 尾逗号，曾发生过和压缩冲突导致白屏，不建议开启
		'comma-dangle': 0,
		'no-underscore-dangle': 0,
		// for (let i = 0; i < len; i++)
		'no-plusplus': 0,
		// https://eslint.org/docs/rules/no-continue
		// labeledLoop is conflicted with `eslint . --fix`
		'no-continue': 0,
		// ban this for Number.isNaN needs polyfill
		'no-restricted-globals': 0,
		'max-classes-per-file': 0,

		// https://github.com/typescript-eslint/typescript-eslint/issues/2540#issuecomment-692866111
		'no-use-before-define': 0,
		'@typescript-eslint/no-use-before-define': 2,
		'no-shadow': 0,
		'@typescript-eslint/no-shadow': [2, {ignoreTypeValueShadow: true}],
		// https://github.com/typescript-eslint/typescript-eslint/issues/2528#issuecomment-689369395
		'no-undef': 0
	},
	// 自定义全局变量
	globals: {
		SharedArrayBuffer: 'readonly'
	}
};
