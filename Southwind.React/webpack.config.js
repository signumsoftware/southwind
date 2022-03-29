/// <binding />
"use strict";
var path = require('path');
var webpack = require('webpack');
var AssetsPlugin = require('assets-webpack-plugin');
var WebpackNotifierPlugin = require('webpack-notifier');
//const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
var node_modules = path.join(__dirname, "node_modules");

module.exports = {
  mode: "development",  //Now mandatory, alternatively “production”
  devtool: false, //To remove source maps in “development”, avoids problems with errors in Chrome
  entry: {
    main: ["./App/MainPublic.tsx"],
  },
  output: {
    path: path.join(__dirname, "wwwroot", "dist"),
    filename: "bundle.[name].[chunkhash].js",
    chunkFilename: "bundle.[name].[chunkhash].js"
  },
  resolve: {
    modules: [node_modules],
    extensions: ['.Webpack.js', '.web.js', '.ts', '.js', '.tsx'],
    alias: {
      '@framework': path.resolve(__dirname, '../Framework/Signum.React/Scripts'),
      '@extensions': path.resolve(__dirname, '../Framework/Signum.React.Extensions')
    }
  },
  resolveLoader: { modules: [node_modules] },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
              compilerOptions: {
                "noEmit": false
              }
            }
          },
        ]
      },
      {
        test: /\.css$/,
        use: [
          { loader: "style-loader" },
          { loader: "css-loader" }
        ]
      },
      {
        test: /\.scss/,
        use: [
          { loader: "style-loader" },
          { loader: "css-loader" },
          { loader: "sass-loader" }
        ]
      },
      { test: /\.gif$/, type: "asset" },
      { test: /\.png$/, type: "asset" },
      { test: /\.woff(2)?(\?v=[0-9].[0-9].[0-9])?$/, type: "asset" },
      { test: /\.(ttf|eot|svg)(\?.*)?$/, type: "asset" }
    ]
  },
  plugins: [
    //new BundleAnalyzerPlugin(),
    new webpack.DllReferencePlugin({
      context: path.join(__dirname, "App"),
      manifest: require("./wwwroot/dist/vendor-manifest.json")
    }),
    new AssetsPlugin({
      fullPath: false,
      path: path.join(__dirname, "wwwroot", "dist"),
    }),
    new WebpackNotifierPlugin({ title: 'Southwind', alwaysNotify: true }),
  ],
}
