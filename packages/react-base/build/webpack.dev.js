/**
 * webpack config (dev)
 */
const {merge} = require('webpack-merge');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const defaultConfig = env => {

	return merge([
		require('./webpack.base')(env),
		{
			mode: 'development',
			//https://github.com/webpack/webpack-dev-server/issues/2758
			target: 'web',
			cache: {
				type: 'filesystem',
					// 不同环境的缓存需要区分开
					cacheDirectory: path.resolve(__dirname,'../', 'node_modules/.cache/webpack/dev'),
				store: 'pack',
				buildDependencies: {
				  defaultWebpack: ['webpack/lib/'],
				  config: [__filename],
				},
			},
			entry: {
				bundle: path.join(__dirname,'../', 'src', 'index.tsx')
			},
			output: {
				pathInfo:true,
				devtoolModuleFilenameTemplate:  (info => path.resolve(info.absoluteResourcePath).replace(/\\/g, '/')) ,
			},

			optimization: {
				minimize: false,
				moduleIds: 'named',
				splitChunks: {
					chunks: 'all', // initial、async和all
					minSize: 30000, // 形成一个新代码块最小的体积
					maxAsyncRequests: 5, // 按需加载时候最大的并行请求数
					maxInitialRequests: 3, // 最大初始化请求数
					automaticNameDelimiter: '~', // 打包分割符

					cacheGroups: {
						defaultVendors: {
							chunks: 'all',
							test: /(react|react-dom|react-dom-router|core-js)/,
							priority: 100,
							name: 'vendors'
						},
						commons: {
							chunks: 'all',
							minChunks: 2,
							name: 'commons',
							priority: 80
						}
					}
				}
			},
			devServer: {
				compress: false,
				historyApiFallback: true,
				port: 8001,
				proxy: {
					'/mock': {
						target: 'http://yapi.ichangtou.com/mock',
						secure: false,
						changeOrigin: true,
						pathRewrite: {
							'^/mock': ''
						}
					}
				},
			},
			module:{
				rules:[
					{
						enforce: 'pre',
						exclude: /@babel(?:\/|\\{1,2})runtime/,
						test: /\.(js|mjs|jsx|ts|tsx|css)$/,
						loader: require.resolve('source-map-loader'),
					  },
				]
			},
			plugins: [
				new MiniCssExtractPlugin({
					ignoreOrder: true,
					filename: '[name].[contenthash:8].css',
					chunkFilename: '[name].[contenthash:8].css'
				}),
				new HtmlWebpackPlugin({
					title: 'Hello（开发）',
					template: path.resolve(__dirname,'../', 'public/index.ejs'),
					filename: 'index.html',
					hash: false,
					inject: true,
					chunks: ['bundle', 'vendors'],
					chunksSortMode: 'manual',
					version: '1.0.0',
					env: 'development',
				}),
				new ForkTsCheckerWebpackPlugin({
					eslint: {files: '**/*.{ts,tsx}'},
					async: true,
					typescript: {
					  typescriptPath: resolve.sync('typescript', {
						basedir: './src',
					  }),
					  configOverwrite: {
						compilerOptions: {
						  sourceMap: true,
						  skipLibCheck: true,
						  inlineSourceMap: false,
						  declarationMap: false,
						  noEmit: true,
						  incremental: true,
						},
					  },
					  context: './',
					  diagnosticOptions: {
						syntactic: true,
					  },
					  mode: 'write-references',
					},
					issue: {
					  include: [
						{ file: '../**/src/**/*.{ts,tsx}' },
						{ file: '**/src/**/*.{ts,tsx}' },
					  ],
					  exclude: [
						{ file: '**/src/**/__tests__/**' },
						{ file: '**/src/**/?(*.){spec|test}.*' },
						{ file: '**/src/setupProxy.*' },
						{ file: '**/src/setupTests.*' },
					  ],
					},
					// logger: {
					//   infrastructure: 'silent',
					// },
				})
			],
			devtool: 'cheap-module-source-map',
			stats: 'errors-only'
		}
	]);
};

module.exports = defaultConfig;
