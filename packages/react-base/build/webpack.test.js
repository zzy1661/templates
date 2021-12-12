const {merge} = require('webpack-merge');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const TerserPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('css-minimizer-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const config = require(path.join('../', 'opsrc.js'));

const pkg = require(path.join('../', 'package.json'));
// let BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const defaultConfig = env => {
	const {app} = config;
	return merge([
		require('./webpack.base')(env),
		{
			mode: 'development',
			cache: {
				type: 'filesystem',
				cacheDirectory: path.resolve('../', 'node_modules/.cache/webpack/dev')
			},
			entry: {
				bundle: path.join('../', 'src', 'index.tsx')
			},
			output: {
				path: path.join('../', 'dist'),
				filename: `[name].[chunkhash:8].js`,
				chunkFilename: `[name].[chunkhash:8].js`
			},
			optimization: {
				moduleIds: 'deterministic',
				minimizer: [
					new TerserPlugin({
						parallel: true
					}),
					new OptimizeCSSAssetsPlugin({})
				],
				splitChunks: {
					chunks: 'all', // initial、async和all
					minSize: 30000, // 形成一个新代码块最小的体积
					maxAsyncRequests: 5, // 按需加载时候最大的并行请求数
					maxInitialRequests: 3, // 最大初始化请求数
					automaticNameDelimiter: '~', // 打包分割符
					cacheGroups: {
						defaultVendors: {
							chunks: 'all',
							test: /(react|react-dom|react-dom-router|core-js|mobx)/,
							priority: 100,
							name: 'vendors'
						},
						commons: {
							chunks: 'all',
							minChunks: 5,
							name: 'commons',
							priority: 80
						}
					}
				}
			},
			plugins: [
				// new BundleAnalyzerPlugin({
				// 	analyzerPort: 8888
				// }),

				new MiniCssExtractPlugin({
					filename: `[name].[contenthash:8].css`,
					chunkFilename: `[name].[contenthash:8].css`
				}),
				new HtmlWebpackPlugin({
					title: 'Hello（开发）',
					template: path.resolve('../', 'public/index.ejs'),
					filename: 'index.htlm',
					hash: false,
					inject: true,
					chunks: ['bundle', 'vendors'],
					chunksSortMode: 'manual',
					minify: {
						removeComments: true, //删除注释
						collapseWhitespace: true //删除空格
					},
					env: 'test',
					version:'1.0.0',
				}),
			
			],
			devtool: 'source-map',
			stats: 'errors-only'
		}
	]);
};

module.exports =defaultConfig
