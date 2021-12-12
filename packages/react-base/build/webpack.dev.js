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
				cacheDirectory: path.resolve(__dirname,'../', 'node_modules/.cache/webpack/local')
			},
			entry: {
				bundle: path.join(__dirname,'../', 'src', 'index.tsx')
			},
			output: {
				path: path.join(__dirname,'../', 'dev'),
				filename: '[name].[contenthash:8].js',
				sourceMapFilename: '[name].[contenthash:8].map'
			},

			optimization: {
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
							test: /(react|react-dom|react-dom-router|core-js|mobx)/,
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
					// eslint: {files: '**/*.{ts,tsx}'}
				})
			],
			devtool: 'eval-source-map',
			stats: 'errors-only'
		}
	]);
};

module.exports = defaultConfig;
