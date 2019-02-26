"use strict";

const path = require('path');
const webpack = require('webpack');
const AssetsPlugin = require('assets-webpack-plugin');
const WebpackNotifierPlugin = require('webpack-notifier');
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const node_modules = path.join(__dirname, "node_modules");

// Source maps are resource heavy and can cause out of memory issue for large source files.
const shouldUseSourceMap = 'false';

module.exports = env => {
  const isEnvDevelopment = env.NODE_ENV === 'development';
  const isEnvProduction = env.NODE_ENV === 'production';

  return {
    mode: isEnvProduction ? 'production' : isEnvDevelopment && 'development',
    bail: isEnvProduction,
    devtool: isEnvProduction
      ? shouldUseSourceMap
        ? 'source-map'
        : false
      : isEnvDevelopment && 'eval-source-map',
    entry: {
      main: ['./polyfills.js', './App/Main.tsx'],
    },
    output: {
      path: path.join(__dirname, "wwwroot", "dist"),
      filename: "bundle.[name].[chunkhash].js",
      chunkFilename: "bundle.[name].[chunkhash].js"
    },
    optimization: {
      runtimeChunk: 'single',
      splitChunks: {
        chunks: 'all',
        maxInitialRequests: Infinity,
        minSize: 0,
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name(module) {
              // get the name. E.g. node_modules/packageName/not/this/part.js
              // or node_modules/packageName
              const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
              // npm package names are URL-safe, but some servers don't like @ symbols
              return `npm.${packageName.replace('@', '')}`;
            },
          },
        },
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
          loader: 'awesome-typescript-loader',
          options: {
            useCache: true,
            useBabel: false,
            transpileOnly: true,
            reportFiles: [
              "App/**/*.{ts,tsx}"
            ]
          }
        },
        {
          test: /\.(js|mjs)$/,
          include: /node_modules/,
          type: "javascript/auto"
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
      new webpack.HashedModuleIdsPlugin(), // so that file hashes don't change unexpectedly
      new ForkTsCheckerWebpackPlugin({
        checkSyntacticErrors: true,
        reportFiles: [
          'App/**/*.{ts,tsx}',
          '!**/*.json',
        ],
        watch: "App",
        silent: true,
      }),
      new HardSourceWebpackPlugin(),
      // Ignore all locale files of moment.js
      new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
      new AssetsPlugin({
        path: path.join(__dirname, "wwwroot", "dist")
      }),
      new WebpackNotifierPlugin({ title: 'Signum', excludeWarnings: true, alwaysNotify: true }),
    ],
  }
}
