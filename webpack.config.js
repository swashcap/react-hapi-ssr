module.exports = {
  devServer: {
    hotOnly: true,
    publicPath: '/dist/',
  },
  devtool: 'source-map',
  entry: './src/client/index.tsx',
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
    ],
  },
  output: {
    filename: '[name].bundle.js',
    publicPath: '/dist/',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json'],
  },
}
