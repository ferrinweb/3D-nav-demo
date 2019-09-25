const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  devServer: {
    contentBase: path.resolve(__dirname, 'dist'),
    compress: true,
    port: 9000,
    host: '0.0.0.0',
    hot: true
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      title: 'Development',
      template: 'index.html'
    }),
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new UglifyJSPlugin({
      sourceMap: true
    }),
    new CopyWebpackPlugin([
      { from: path.resolve(__dirname, 'models'), to: path.resolve(__dirname, 'dist/models') },
      { from: path.resolve(__dirname, 'images'), to: path.resolve(__dirname, 'dist/images') }
    ])
  ],
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|models|dist)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: './'
  },
  optimization: {
    splitChunks: {
      name: 'common' // 指定公共 bundle 的名称。
    }
  }
}
