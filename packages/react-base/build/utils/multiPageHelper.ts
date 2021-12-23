import glob from 'glob';
import path from 'path';
import pkg from '../../package.json'

import HtmlWebpackPlugin from 'html-webpack-plugin'
let htmlPlugins = {};
let entries: Record<string, string> = null;
export function getEntries(production?: boolean) {
	if(entries) {
		return entries;
	}
	entries = glob.sync('src/index*.tsx').reduce((pre, file) => {
		let name = file.match(/index(\S{0,})\.tsx/)?.[1] || 'index';
		pre[name] = path.join(__dirname,'../../',file);
		let html = glob.sync(`public/${name}.+(html|ejs)`)?.[0];
		htmlPlugins['HtmlWebpackPlugin-'+name] = [HtmlWebpackPlugin,Object.assign(
			{
				inject: true,
				template: path.join(__dirname,'../../',html),
				title: 'Hello' + (production ? '' : '开发'),
				hash: false,
				chunks: [name, 'vendors'],
				version: pkg.version,
				env: production?'production':'development'
			},
			production
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
		)]
		return pre;
	}, {});
	return entries
}
export function getHtmlPlugins(production?: boolean) {
	getEntries();
	return htmlPlugins;
}

export {
	entries,
	htmlPlugins
}
