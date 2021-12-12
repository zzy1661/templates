/**
 * Common setting for all webpack build
 */
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const {WebpackManifestPlugin} = require('webpack-manifest-plugin');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');


const alias = {
	'@': path.resolve(__dirname, '../src')
};


module.exports = env => {
	let cusEnv = {};

	return {
		resolve: {
			extensions: ['.ts', '.tsx', '.js', '.json'],
			alias
		},
		module: {
			rules: [
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
					test: /\.jsx?$/,
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
					test: /\.tsx?$/,
					exclude: /node_modules/,
					use: [
						{
							loader: 'babel-loader',
							options: {
								presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript']
							}
						}
					]
				},
				{
					test: /\.css/,
					exclude: /(src)/,
					use: [
						MiniCssExtractPlugin.loader,
						{
							loader: 'css-loader'
						}
					]
				},
				{
					test: /\.less/,
					include: /(antd)|(antd-mobile)|(ictd-mobile)/,
					use: [
						MiniCssExtractPlugin.loader,
						{
							loader: 'css-loader'
						},
						{
							loader: 'postcss-loader'
						},
						{
							loader: 'less-loader',
							options: {
								lessOptions: {
									javascriptEnabled: true
								}
							}
						}
					]
					// use style-loader in development
				},
				{
					test: /\.less/,
					exclude: /(antd)|(antd-mobile)|(ictd-mobile)/,
					use: [
						{
							loader: MiniCssExtractPlugin.loader,
							options: {
								publicPath: '/'
							}
						},

						{
							loader: 'css-loader',
							options: {
								modules: {
									localIdentName: '[name]_[local]_[hash:base64:5]'
								},
								importLoaders: 2
							}
						},
						{
							loader: 'postcss-loader'
						},
						{
							loader: 'less-loader',
							options: {
								lessOptions: {
									javascriptEnabled: true
								}
							}
						}
					]
				},
				{
					test: /\.(png|jpe?g|gif|svg|eot|woff|woff2|ttf)(\?.*)?$/,
					exclude: /(antd)|(antd-mobile)/,
					type: 'asset',
					parser: {
						dataUrlCondition: {
							maxSize: 10 * 1024 // 10kb
						}
					},
					generator: {
						filename: `/assets/img/[name].[hash:7].[ext]` //'static/[hash][ext][query]'
					}
				}
			]
		},
		plugins: [
			new WebpackManifestPlugin(),
			new webpack.DefinePlugin({
				AppRuntimeEnv: JSON.stringify(env.runtime || 'local'),
				...cusEnv
			}),
			new CopyPlugin({
				patterns: [{from: 'public', to: '', filter: file => !/(\.ejs$)|(\.xml$)|(\.html$)/.test(file)}]
			})
		]
	};
};
