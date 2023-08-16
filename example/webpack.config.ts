import Webpack from 'webpack'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import path from 'path'
import 'webpack-dev-server'

const config: Webpack.Configuration = {
  mode: 'development',
  devtool: 'inline-source-map',

  entry: path.resolve(__dirname, './index.ts'),
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'bundle.js',
    clean: true
  },

  resolve: {
    extensions: ['.ts', '.js', '.tsx']
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: ['ts-loader']
      },
      {
        test: /\.s?css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },

  devServer: {
    open: true,
    static: {
      directory: path.resolve(__dirname, './assets'),
      publicPath: '/assets'
    }
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, './public/index.html'),
      favicon: path.resolve(__dirname, './public/favicon.png'),
    })
  ]
}

export default config