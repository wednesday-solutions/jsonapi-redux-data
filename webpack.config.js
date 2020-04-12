const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'jsonapi-redux-data.js',
    library: 'jsonapi-redux-data',
    libraryTarget: 'umd'
  },
  externals: {
    lodash: {
      commonjs: 'lodash',
      commonjs2: 'lodash',
      amd: 'lodash',
      root: '_'
    }
  },
  resolve: {
    modules: ['node_modules', 'app'],
    alias: {
      src: path.resolve(__dirname, './src'),
      services: path.resolve(__dirname, './src/services'),
      selectors: path.resolve(__dirname, './src/selectors'),
      reducers: path.resolve(__dirname, './src/reducers'),
      utils: path.resolve(__dirname, './src/utils')
    },
    extensions: ['.js', '.jsx', '.react.js'],
    mainFields: ['browser', 'jsnext:main', 'main']
  }
};
