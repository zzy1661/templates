import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import path from 'path';
export const getStyleLoaders = (cssOptions, preProcessor?) => {
	const loaders = [
		{
			loader: MiniCssExtractPlugin.loader
		},
		{
			loader: 'css-loader',
			options: cssOptions
		},
		{
			loader: 'postcss-loader',
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
						]

						// 'postcss-normalize'
					]
				},
				sourceMap: true
			}
		}
	];
	if (preProcessor) {
		loaders.push(
			{
				loader: 'resolve-url-loader',
				options: {
					sourceMap: true,
					root: path.join(__dirname, '../../src')
				}
			},
			{
				loader: preProcessor,
				options: {
					sourceMap: true
				}
			}
		);
	}
	return loaders;
};

let getCssOptions = (importLoaders = 1) => ({
	importLoaders,
	sourceMap: true,
	modules: {
		mode: 'icss',
		localIdentName: '[name]_[local]_[hash:base64:5]'
	}
});
let getModuleCssOptions = (importLoaders = 1) => ({
	importLoaders,
	sourceMap: true,
	modules: {
		mode: 'local',
		localIdentName: '[name]_[local]_[hash:base64:5]'
	}
});
export const getStyleRules = () => {
	return [
		{
			test: /\.css$/,
			exclude: /\.module\.css$/,
			use: getStyleLoaders(getCssOptions()),
			sideEffects: true
		},
		{
			test: /\.module\.css$/,
			use: getStyleLoaders(getModuleCssOptions())
		},
		{
			test: /\.(scss|sass)$/,
			exclude: /\.module\.(scss|sass)$/,
			use: getStyleLoaders(getCssOptions(3), 'sass-loader'),
			sideEffects: true
		},
		{
			test: /\.module\.(scss|sass)$/,
			use: getStyleLoaders(getModuleCssOptions(3), 'sass-loader')
		},
		{
			test: /\.(less)$/,
			exclude: /\.module\.(less)$/,
			use: getStyleLoaders(getCssOptions(3), 'less-loader'),
			sideEffects: true
		},
		{
			test: /\.module\.(less)$/,
			use: getStyleLoaders(getModuleCssOptions(3), 'less-loader')
		}
	];
};
