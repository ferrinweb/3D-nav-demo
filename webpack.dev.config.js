'use strict'
const webpack = require('webpack')
const merge = require('webpack-merge')
const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const portFinder = require('portfinder')

const host = 'localhost'
const port = 9000

const createNotifierCallback = () => {
  const notifier = require('node-notifier')

  return (severity, errors) => {
    if (severity !== 'error') return

    const error = errors[0]
    const filename = error.file && error.file.split('!').pop()

    notifier.notify({
      title: 'Dev Log',
      message: severity + ': ' + error.name,
      subtitle: filename || '',
      icon: path.join(__dirname, 'logo.png')
    })
  }
}

const devWebpackConfig = merge({
  // these devServer options should be customized in /config/index.js
  devServer: {
    clientLogLevel: 'error',
    hot: true,
    contentBase: false, // since we use CopyWebpackPlugin.
    compress: true,
    host,
    port,
    open: true,
    publicPath: '/',
    quiet: true // necessary for FriendlyErrorsPlugin
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(), // HMR shows correct file names in console on update.
    new webpack.NoEmitOnErrorsPlugin(),
    // https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.html',
      inject: true
    }),
    // copy custom static assets
    new CopyWebpackPlugin([
      { from: path.resolve(__dirname, 'models'), to: path.resolve(__dirname, 'dist/models') },
      { from: path.resolve(__dirname, 'images'), to: path.resolve(__dirname, 'dist/images') }
    ])
  ]
})

module.exports = new Promise((resolve, reject) => {
  portFinder.basePort = 9000
  portFinder.getPort((err, port) => {
    if (err) {
      reject(err)
    } else {
      // publish the new Port, necessary for e2e tests
      process.env.PORT = port
      // add port to devServer config
      devWebpackConfig.devServer.port = port

      // Add FriendlyErrorsPlugin
      devWebpackConfig.plugins.push(new FriendlyErrorsPlugin({
        compilationSuccessInfo: {
          messages: [`Your application is running here: http://${devWebpackConfig.devServer.host}:${port}`]
        },
        onErrors: createNotifierCallback()
      }))

      resolve(devWebpackConfig)
    }
  })
})
