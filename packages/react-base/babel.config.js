module.exports = function (api) {
	api.cache(false);
	const presets = [
		['@babel/preset-react'],
		[
			'@babel/preset-env',
			{
				modules: 'commonjs',
				useBuiltIns: 'entry', //使用usage，不转换react中的Set，导致部分老手机（荣耀6）白屏
				corejs: '3'
			}
		]
	];
	const plugins = [
		
	
	
		['import', { libraryName: 'antd', style: true }, 'antd'],
		'@babel/plugin-syntax-dynamic-import',
		'@babel/plugin-syntax-import-meta'
	];
	return {
		presets,
		plugins
	};
};
