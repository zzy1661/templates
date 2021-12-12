/**
 * Common setting for all webpack build
 */
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const {WebpackManifestPlugin} = require('webpack-manifest-plugin');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
// const requireDir = require('require-dir');
// const fs = require('fs-extra')
const plugins = [];
const glob = require('glob');
const {fstat} = require('fs');

let htmlPlugins = [];
let entries = glob.sync('./src/index*.tsx').reduce((pre, file) => {
	let name = file.match(/index(\S{0,})\.tsx/)?.[1] || 'index';
	pre[name] = path.resolve(file);
	let html = glob.sync(`./public/${name}.+(html|ejs)`);
	htmlPlugins.push(
		new HtmlWebpackPlugin(
			Object.assign(
				{},
				{
					inject: true,
					template: html,
					title: 'Hello' + (process.env.NODE_ENV === 'production' ? '开发' : ''),
					hash: false,
					chunks: [name, 'vendors'],
					version: '1.0.0',
					env: process.env.NODE_ENV
				},
				process.env.NODE_ENV === 'production'
					? {
							minify: {
								removeComments: true,
								collapseWhitespace: true,
								removeRedundantAttributes: true,
								useShortDoctype: true,
								removeEmptyAttributes: true,
								removeStyleLinkTypeAttributes: true,
								keepClosingSlash: true,
								minifyJS: true,
								minifyCSS: true,
								minifyURLs: true
							}
					  }
					: undefined
			)
		)
	);
	return pre;
}, {});

const getStyleLoaders = (cssOptions, preProcessor) => {
	const loaders = [
		{
			loader: MiniCssExtractPlugin.loader
		},
		{
			loader: require.resolve('css-loader'),
			options: cssOptions
		},
		{
			loader: require.resolve('postcss-loader'),
			options: {
				postcssOptions: {
					ident: 'postcss',
					plugins: [
						'postcss-flexbugs-fixes',
						[
							'postcss-preset-env',
							{
								autoprefixer: {
									flexbox: 'no-2009'
								},
								stage: 3
							}
						],

						'postcss-normalize'
					]
				},
				sourceMap: true
			}
		}
	];
	if (preProcessor) {
		loaders.push(
			{
				loader: require.resolve('resolve-url-loader'),
				options: {
					sourceMap: true,
					root: path.join(__dirname, '../src')
				}
			},
			{
				loader: require.resolve(preProcessor),
				options: {
					sourceMap: true
				}
			}
		);
	}
	return loaders;
};
module.exports = env => {
	return {
		target: ['browserslist'],
		entry: entries,
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
									loader: require.resolve('@svgr/webpack'),
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
									loader: require.resolve('file-loader'),
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
										babelrc: true
									}
								}
							]
						},
						{
							test: /\.(js|mjs|jsx|ts|tsx)$/,
							exclude: /node_modules/,
							loader: require.resolve('babel-loader'),
							options: {
								babelrc: true
							}
						},
						{
							test: /\.(js|mjs)$/,
							exclude: /@babel(?:\/|\\{1,2})runtime/,
							loader: require.resolve('babel-loader'),
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
						{
							test: /\.css$/,
							exclude: /\.module\.css$/,
							use: getStyleLoaders({
								importLoaders: 1,
								sourceMap: true,
								modules: {
									mode: 'icss',
									localIdentName: '[name]_[local]_[hash:base64:5]'
								}
							}),
							sideEffects: true
						},

						{
							test: /\.module\.css$/,
							use: getStyleLoaders({
								importLoaders: 1,
								sourceMap: true,
								modules: {
									mode: 'local',
									localIdentName: '[name]_[local]_m_[hash:base64:5]'
								}
							})
						},

						{
							test: /\.(scss|sass)$/,
							exclude: /\.module\.(scss|sass)$/,
							use: getStyleLoaders(
								{
									importLoaders: 3,
									sourceMap: true,
									modules: {
										mode: 'icss'
									}
								},
								'sass-loader'
							),
							sideEffects: true
						},
						{
							test: /\.module\.(scss|sass)$/,
							use: getStyleLoaders(
								{
									importLoaders: 3,
									sourceMap: true,
									modules: {
										mode: 'local',
										localIdentName: '[name]_[local]_m_[hash:base64:5]'
									}
								},
								'sass-loader'
							)
						},
						{
							test: /\.(less)$/,
							exclude: /\.module\.(less)$/,
							use: getStyleLoaders(
								{
									importLoaders: 3,
									sourceMap: true,
									modules: {
										mode: 'icss'
									}
								},
								'less-loader'
							),
							sideEffects: true
						},
						{
							test: /\.module\.(less)$/,
							use: getStyleLoaders(
								{
									importLoaders: 3,
									sourceMap: true,
									modules: {
										mode: 'local',
										localIdentName: '[name]_[local]_m_[hash:base64:5]'
									}
								},
								'less-loader'
							)
						},
						{
							exclude: [/^$/, /\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
							type: 'asset/resource'
						}
					]
				}
			]
		},
		plugins: [
			...htmlPlugins,
			new CaseSensitivePathsPlugin(),
			new WebpackManifestPlugin({
				fileName: 'asset-manifest.json',
				publicPath: '/',
				generate: (seed, files, entrypoints) => {
					const manifestFiles = files.reduce((manifest, file) => {
						manifest[file.name] = file.path;
						return manifest;
					}, seed);
					const entrypointFiles = entrypoints.main.filter(fileName => !fileName.endsWith('.map'));

					return {
						files: manifestFiles,
						entrypoints: entrypointFiles
					};
				}
			}),
			new webpack.DefinePlugin({
				AppRuntimeEnv: JSON.stringify(env.runtime || 'local')
			}),
			new webpack.IgnorePlugin({
				resourceRegExp: /^\.\/locale$/,
				contextRegExp: /moment$/
			}),
			new CopyPlugin({
				patterns: [{from: 'public', to: '', filter: file => !/(\.ejs$)|(\.xml$)|(\.html$)/.test(file)}]
			})
		],
		performance: true
	};
};
