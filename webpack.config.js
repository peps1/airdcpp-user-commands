const path = require('path');
const webpack = require('webpack');

const packageJson = require('./package.json');

const release = process.env.NODE_ENV === 'production';
const profiling = !!process.env.PROFILING;

const plugins = [
  // Optional binary requires that should be ignored
  new webpack.IgnorePlugin(/.*\/build\/.*\/(validation|bufferutil)/),
  new webpack.DefinePlugin({
    'EXTENSION_NAME': JSON.stringify(packageJson.name),
    'EXTENSION_VERSION': JSON.stringify(packageJson.version),
    'EXTENSION_BUILD_TIME': JSON.stringify((new Date).getTime()),
  })
];

console.log('Release: ' + release);
console.log('Profiling: ' + profiling);

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
  entry: release && !profiling ? './src/index.ts' : './src/main.ts',
  target: 'node',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'main.js',
    libraryTarget: 'umd'
  },
  optimization: {
    minimize: release && !profiling ? true : false,
  },
  plugins: plugins,
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.(ts|js)$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [ '.ts', '.js' ],
    modules: [
      path.resolve('./src'),
      'node_modules'
    ],
  },
}
