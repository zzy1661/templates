module.exports = {
  important: true, // 生成!important的类
  // production下的tree shake
  // purge: {
  //   layers: ['components', 'utilities'],
  //   content: ['./public/*.html', './public/*.ejs', './src/**/*.js', './src/**/*.vue', './src/**/*.tsx']
  // },
  content: ['./public/*.{html,ejs}', './src/**/*.{vue,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
}
