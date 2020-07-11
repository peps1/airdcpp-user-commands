var path = require('path');
const { resolve } = require('path')
var webpack = require('webpack');

var packageJson = require('./package.json');

var release = process.env.NODE_ENV === 'production';

var plugins = [
  // Optional binary requires that should be ignored
  new webpack.IgnorePlugin(/.*\/build\/.*\/(validation|bufferutil)/),
  new webpack.DefinePlugin({
    'EXTENSION_NAME': JSON.stringify(packageJson.name),
    'EXTENSION_VERSION': JSON.stringify(packageJson.version),
    'EXTENSION_BUILD_TIME': JSON.stringify((new Date).getTime()),
  })
];

console.log('Release: ' + release);

if (!release) {
  // Required for debugging
  // Release build should add the require manually so that the module gets bundled
  plugins.push(
    new webpack.BannerPlugin({
      banner: 'require("source-map-support").install();',
      raw: true,
      entryOnly: false
    })
  );
}

module.exports = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  entry: release ? resolve('./src/index.ts') : resolve('./src/main.ts'),
  target: 'node',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'main.js',
    libraryTarget: 'umd'
  },
  plugins,
  devtool: 'source-map',
  resolve: {
    extensions: ['.webpack.js', '.web.js', '.ts', '.tsx', '.js'],
    modules: [ path.join(__dirname, 'node_modules') ]
  },
  module: {
    rules: [
      {
        // Include ts, tsx, js, and jsx files.
        test: /\.(ts|js)x?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      }
    ]
  },
}
