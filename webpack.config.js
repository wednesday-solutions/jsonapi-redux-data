const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
var LodashModuleReplacementPlugin = require('lodash-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'jsonapi-redux-data.js',
    library: 'jsonapi-redux-data',
    libraryTarget: 'commonjs2'
  },
  externals: {
    lodash: {
      commonjs: 'lodash',
      commonjs2: 'lodash',
      amd: 'lodash',
      root: '_'
    }
  },
  optimization: {
    minimize: true,
    usedExports: true,
    providedExports: true,
    minimizer: [
      new TerserPlugin({
        cache: true,
        parallel: true,
        sourceMap: true,
        terserOptions: {
          // https://github.com/webpack-contrib/terser-webpack-plugin#terseroptions
        }
      })
    ]
  },
  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'production'
    }),
    new LodashModuleReplacementPlugin(),
    new BundleAnalyzerPlugin()
  ],
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
