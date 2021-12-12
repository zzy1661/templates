/**
 * webpack config (prod)
 */
const {merge} = require('webpack-merge');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const pkg = require(path.join(__dirname,'../' ,'package.json'));
process.env.NODE_ENV = 'production';


const defaultConfig = env => {
	return merge([
		require('./webpack.base')(env),
		{
			mode: 'production',
			entry: {
				bundle: path.join(__dirname,'../' ,'src', 'index.tsx')
			},

			output: {
				path: path.join(__dirname,'../' ,'dist'),
				filename: `[name].[chunkhash:8].js`,
				chunkFilename: `[name].[chunkhash:8].js`
			},
			optimization: {
				moduleIds: 'deterministic',
				minimizer: [
					new TerserPlugin({
						parallel: true,
						terserOptions: {
							mangle: {
								safari10: true
							},
							output: {
								comments: false
							}
						}
					}),
					new CssMinimizerPlugin()
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
				// new BundleAnalyzerPlugin(),
				new MiniCssExtractPlugin({
					ignoreOrder: true,
					filename: `[name].[contenthash:8].css`,
					chunkFilename: `[name].[contenthash:8].css`
				}),

				new HtmlWebpackPlugin({
					title: 'Hello',
					template: path.resolve(__dirname,'../' ,'public/index.ejs'),
					filename: 'index.html',
					hash: false,
					inject: true,
					minify: {
						removeComments: true, //删除注释
						collapseWhitespace: true //删除空格
					},
					env: 'production',
					version: '1.0.0',
				}),
				
			],
			devtool: 'source-map'
		}
	]);
};

module.exports = defaultConfig;
