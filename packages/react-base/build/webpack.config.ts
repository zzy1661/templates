import path from 'path';

import {WebpackManifestPlugin} from 'webpack-manifest-plugin';
import webpack, {DefinePlugin, IgnorePlugin} from 'webpack';
import CopyPlugin from 'copy-webpack-plugin';
import {getEntries, getHtmlPlugins} from './utils/multiPageHelper';
import {getStyleRules} from './utils/getStyleRules';
import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import resolve from 'resolve';
import webpackChain from 'webpack-chain';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
module.exports = env => {
	const defaultConfig: webpack.Configuration = {
		target: ['browserslist'],
		entry: getEntries(env.production),
		output: {
			path: path.join(__dirname, '../', 'dist'),
			filename: `[name].[contenthash:8].js`,
			chunkFilename: `[name].[contenthash:8].chunk.js`,
			assetModuleFilename: 'assets/media/[name].[hash][ext]',
			publicPath: '/'
		},
		// infrastructureLogging: {
		// 	level: 'none',
		//   },
		resolve: {
			modules: ['node_modules'],
			extensions: ['.ts', '.tsx', '.js', '.json'],
			alias: {
				'@': path.resolve(__dirname, '../src')
			}
		},
		module: {
			parser: {
				javascript: {
					exportsPresence: 'error'
				}
			},
			rules: [
				{
					oneOf: [
						{
							test: /\.(png|jpe?g|gif|eot|woff|woff2|ttf)(\?.*)?$/,
							exclude: /(antd)|(antd-mobile)/,
							type: 'asset',
							parser: {
								dataUrlCondition: {
									maxSize: 10 * 1024 // 10kb
								}
							}
						},
						{
							test: /\.svg$/,
							use: [
								{
									loader: '@svgr/webpack',
									options: {
										prettier: false,
										svgo: false,
										svgoConfig: {
											plugins: [{removeViewBox: false}]
										},
										titleProp: true,
										ref: true
									}
								},
								{
									loader: 'file-loader',
									options: {
										name: 'assets/media/[name].[hash].[ext]'
									}
								}
							],
							issuer: {
								and: [/\.(ts|tsx|js|jsx|md|mdx)$/]
							}
						},
						{
							test: /\.js?$/,
							exclude: /node_modules/,
							use: [
								{
									loader: 'babel-loader',
									options: {
										babelrc: false
									}
								}
							]
						},
						{
							test: /\.(js|mjs|jsx|ts|tsx)$/,
							exclude: /node_modules/,
							use: {
								loader: 'babel-loader',
								options: {
									configFile: path.join(__dirname, '../babel.config.js')
								}
							}
						},
						{
							test: /\.(js|mjs)$/,
							exclude: /@babel(?:\/|\\{1,2})runtime/,
							loader: 'babel-loader',
							options: {
								babelrc: false,
								configFile: false,
								compact: false,
								presets: [
									[
										'@babel/preset-env',
										{
											useBuiltIns: 'entry',
											corejs: 3,
											exclude: ['transform-typeof-symbol']
										}
									]
								],
								plugins: ['@babel/plugin-transform-runtime'],
								cacheDirectory: true,
								cacheCompression: false,
								sourceMaps: true,
								inputSourceMap: true
							}
						},
						...getStyleRules()
						// {
						//     exclude: [/^$/, /\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
						//     type: 'asset/resource'
						// }
					]
				}
			]
		}

		// performance: true
	};
	const plugins: Record<string, any[]> = {
		...getHtmlPlugins(),
		CaseSensitivePathsPlugin: [CaseSensitivePathsPlugin],
		WebpackManifestPlugin: [
			WebpackManifestPlugin,
			{
				fileName: 'asset-manifest.json',
				publicPath: '/'
				// generate: (seed, files, entrypoints) => {
				//     const manifestFiles = files.reduce((manifest, file) => {
				//         manifest[file.name] = file.path;
				//         return manifest;
				//     }, seed);
				//     const entrypointFiles = entrypoints.main.filter(fileName => !fileName.endsWith('.map'));

				//     return {
				//         files: manifestFiles,
				//         entrypoints: entrypointFiles
				//     } as any;
				// }
			} as ConstructorParameters<typeof WebpackManifestPlugin>[0]
		],
		DefinePlugin: [
			webpack.DefinePlugin,
			{
				AppRuntimeEnv: JSON.stringify(env.runtime || 'local')
			} as ConstructorParameters<typeof DefinePlugin>[0]
		],

		IgnorePlugin: [
			webpack.IgnorePlugin,
			{
				resourceRegExp: /^\.\/locale$/,
				contextRegExp: /moment$/
			} as ConstructorParameters<typeof IgnorePlugin>[0]
		],
		CopyPlugin: [
			CopyPlugin,
			{
				patterns: [{from: 'public', to: '', filter: file => !/(\.ejs$)|(\.xml$)|(\.html$)/.test(file)}]
			} as CopyPlugin.CopyPluginOptions
		]
	};
	const chain = new webpackChain();

	chain.merge(defaultConfig);
	let oneOfs = (defaultConfig.module.rules[0] as any).oneOf;
	oneOfs.forEach((rule, index) => {
		let res = chain.module.rule('oneOf').oneOf(index);
		if (rule.use) {
			if (!Array.isArray(rule.use)) {
				res.test(rule.test).use(rule.use.loader).merge(rule.use);
			} else {
				res.merge(rule);
			}
		} else {
			res.merge(rule);
		}
	});

	chain.when(
		env.development,
		config => {
			config.merge({
				mode: 'development',
				cache: {
					type: 'filesystem',
					// 不同环境的缓存需要区分开
					cacheDirectory: path.resolve(__dirname, '../', 'node_modules/.cache/webpack/dev'),
					store: 'pack',
					buildDependencies: {
						defaultWebpack: ['webpack/lib/'],
						config: [__filename]
					}
				},
				output: {
					// pathInfo:true,
					devtoolModuleFilenameTemplate: info => path.resolve(info.absoluteResourcePath).replace(/\\/g, '/')
				},
				optimization: {
					minimize: false,
					moduleIds: 'named'
					// splitChunks: {
					// 	chunks: 'all', // initial、async和all
					// 	minSize: 30000, // 形成一个新代码块最小的体积
					// 	maxAsyncRequests: 5, // 按需加载时候最大的并行请求数
					// 	maxInitialRequests: 3, // 最大初始化请求数
					// 	automaticNameDelimiter: '~', // 打包分割符
					// 	cacheGroups: {
					// 		defaultVendors: {
					// 			chunks: 'all',
					// 			test: /(react|react-dom|react-dom-router|core-js)/,
					// 			priority: 100,
					// 			name: 'vendors'
					// 		},
					// 		commons: {
					// 			chunks: 'all',
					// 			minChunks: 2,
					// 			name: 'commons',
					// 			priority: 80
					// 		}
					// 	}
					// }
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
					}
				},
				plugin: {
					MiniCssExtractPlugin: {
						plugin: MiniCssExtractPlugin,
						args: [
							{
								ignoreOrder: true,
								filename: '[name].[contenthash:8].css',
								chunkFilename: '[name].[contenthash:8].css'
							}
						]
					},
					ForkTsCheckerWebpackPlugin: {
						plugin: ForkTsCheckerWebpackPlugin,
						args: [
							{
								eslint: {files: '**/*.{ts,tsx}'},
								async: true,
								typescript: {
									typescriptPath: resolve.sync('typescript', {
										basedir: path.join(__dirname, '../src')
									}),
									configOverwrite: {
										compilerOptions: {
											sourceMap: true,
											skipLibCheck: true,
											inlineSourceMap: false,
											declarationMap: false,
											noEmit: true,
											incremental: true
										}
									},
									context: './',
									diagnosticOptions: {
										syntactic: true
									},
									mode: 'write-references'
								},
								issue: {
									include: [{file: '../**/src/**/*.{ts,tsx}'}, {file: '**/src/**/*.{ts,tsx}'}],
									exclude: [
										{file: '**/src/**/__tests__/**'},
										{file: '**/src/**/?(*.){spec|test}.*'},
										{file: '**/src/setupProxy.*'},
										{file: '**/src/setupTests.*'}
									]
								}
								// logger: {
								//   infrastructure: 'silent',
								// },
							}
						]
					}
				},
				devtool: 'cheap-module-source-map',
				stats: 'errors-only'
			});
		},
		config => {
			config.merge({
				mode: 'production',
				bail: true,
				output: {
					devtoolModuleFilenameTemplate: info =>
						path.relative(path.resolve(__dirname, '../src'), info.absoluteResourcePath).replace(/\\/g, '/')
				},
				optimization: {
					minimize: true,
					moduleIds: 'deterministic',
					minimizer: [
						new TerserPlugin({
							terserOptions: {
								parse: {
									ecma: 2020
								},
								compress: {
									ecma: 5,
									comparisons: false
								},
								mangle: {
									safari10: true
								},
								keep_classnames: true,
								keep_fnames: true,
								output: {
									ecma: 5,
									comments: false,
									ascii_only: true
								}
							}
						}),
						new CssMinimizerPlugin()
					]
					// splitChunks: {
					// 	chunks: 'all', // initial、async和all
					// 	minSize: 30000, // 形成一个新代码块最小的体积
					// 	maxAsyncRequests: 5, // 按需加载时候最大的并行请求数
					// 	maxInitialRequests: 3, // 最大初始化请求数
					// 	automaticNameDelimiter: '~', // 打包分割符
					// 	cacheGroups: {
					// 		defaultVendors: {
					// 			chunks: 'all',
					// 			test: /(react|react-dom|react-dom-router|core-js)/,
					// 			priority: 100,
					// 			name: 'vendors'
					// 		},
					// 		commons: {
					// 			chunks: 'all',
					// 			minChunks: 5,
					// 			name: 'commons',
					// 			priority: 80
					// 		}
					// 	}
					// }
				},
				plugins: {
					// new BundleAnalyzerPlugin(),
					MiniCssExtractPlugin: {
						plugin: MiniCssExtractPlugin,
						args: [
							{
								ignoreOrder: true,
								filename: `[name].[contenthash:8].css`,
								chunkFilename: `[name].[contenthash:8].chunk.css`
							}
						]
					}
				},
				devtool: 'source-map'
			});
		}
	);
	Object.keys(plugins).forEach(name => {
		let p = chain.plugin(name);
		p.use.call(p, plugins[name][0], [plugins[name][1]]);
	});

	let chainConfig = chain.toConfig();
	// console.log(chainConfig);
	// process.exit(0);
	return chainConfig;
};
