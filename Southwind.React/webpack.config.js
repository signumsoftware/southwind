"use strict";

const path = require('path');
const webpack = require('webpack');
const AssetsPlugin = require('assets-webpack-plugin');
const WebpackNotifierPlugin = require('webpack-notifier');
const node_modules = path.join(__dirname, "node_modules");

module.exports = env => {

  return {
    mode: env.NODE_ENV /*production | development*/,
    bail: env.NODE_ENV === 'production',
    devtool: false /* 'source-map'| 'eval-source-map' */,
    stats: {
      warningsFilter: [w => w.indexOf("was not found in") >= 0], //Removes warnings because of transpileOnly
    },
    entry: {
      main: ['./polyfills.js', './App/Main.tsx'],
    },
    output: {
      path: path.join(__dirname, "wwwroot", "dist"),
      filename: "bundle.[name].[chunkhash].js",
      chunkFilename: "bundle.[name].[chunkhash].js"
    },
    optimization: {
      splitChunks: {
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/](react|react-dom|react-router|react-widgets|react-popper|react-overlays|query-string|moment|numbro|d3)[\\/]/,
            name: 'vendor',
            chunks: 'all',
          }
        }
      },
    },
    resolve: {
      modules: [node_modules],
      extensions: ['.js', '.tsx', '.ts', '.tsx', ".mjs"],
      alias: {
        '@framework': path.resolve(__dirname, '../Framework/Signum.React/Scripts'),
        '@extensions': path.resolve(__dirname, '../Extensions/Signum.React.Extensions')
      }
    },
    resolveLoader: { modules: [node_modules] },
    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/,
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
            compilerOptions: {
              "noEmit": false
            }
          }
        },
        {
          test: /\.css$/,
          use: [
            { loader: "style-loader" },
            { loader: "css-loader" }
          ]
        },
        { test: /\.gif$/, use: [{ loader: "url-loader", options: { "mimetype": "image/gif" } }] },
        { test: /\.png$/, use: [{ loader: "url-loader", options: { "mimetype": "image/png" } }] },
        { test: /\.svg$/, use: [{ loader: "url-loader", options: { "mimetype": "image/svg+xml" } }] },
        { test: /\.woff(2)?(\?v=[0-9].[0-9].[0-9])?$/, use: [{ loader: "url-loader", options: { "mimetype": "application/font-woff" } }] },
        { test: /\.(ttf|eot)(\?.*)?$/, use: [{ loader: "file-loader", options: { "name": "[name].[ext]" } }] }
      ]
    },
    plugins: [
      new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
      new AssetsPlugin({
        path: path.join(__dirname, "wwwroot", "dist")
      }),
      new WebpackNotifierPlugin({ title: 'Signum', excludeWarnings: true, alwaysNotify: true }),
    ],
  }
}
