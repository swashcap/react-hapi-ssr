const ManifestPlugin = require('webpack-manifest-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const path = require('path')
const webpack = require('webpack')

/**
 * Manual script for hot middleware
 * {@link https://github.com/webpack-contrib/webpack-hot-middleware}
 */
const hotMiddlewareScript =
  'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000'

const isProd = process.env.NODE_ENV === 'production'

module.exports = {
  bail: isProd,
  devServer: {
    hotOnly: true,
    publicPath: '/dist/',
  },
  devtool: isProd ? 'source-map' : 'cheap-eval-source-map',
  entry: [!isProd && hotMiddlewareScript, './src/client/index.tsx'].filter(
    Boolean,
  ),
  mode: isProd ? 'production' : 'development',
  module: {
    rules: [
      {
        exclude: /node_modules/,
        test: /\.tsx?$/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
          },
        },
      },
      {
        test: /\.css/,
        use: [
          isProd
            ? {
                loader: MiniCssExtractPlugin.loader,
              }
            : {
                loader: 'style-loader',
              },
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: !isProd,
            },
          },
        ],
      },
    ],
  },
  output: {
    chunkFilename: isProd ? '[name].[chunkhash:8].chunk.js' : '[name].chunk.js',
    filename: isProd ? '[name].[chunkhash:8].js' : '[name].js',
    path: path.join(__dirname, 'dist'),
    publicPath: '/dist/',
  },
  plugins: [
    !isProd && new webpack.HotModuleReplacementPlugin(),

    /**
     * Output a manifest.json with all the Webpack entries
     * {@link https://github.com/danethurber/webpack-manifest-plugin}
     */
    isProd && new ManifestPlugin(),

    /**
     * Build CSS into individual .css files
     * {@link https://github.com/webpack-contrib/mini-css-extract-plugin}
     */
    new MiniCssExtractPlugin({
      chunkFilename: '[id].[chunkhash:8].css',
      filename: '[name].[chunkhash:8].css',
    }),
  ].filter(Boolean),
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json'],
  },
}
