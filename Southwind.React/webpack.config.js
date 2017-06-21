/// <binding />
"use strict";
var path = require('path');
var webpack = require('webpack');
var AssetsPlugin = require('assets-webpack-plugin');
var WebpackNotifierPlugin = require('webpack-notifier');
var node_modules = path.join(__dirname, "node_modules");
var CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: {
        main: ["./App/Main.tsx"],
    },
    output: {
        path: path.join(__dirname, "dist"),
        filename: "bundle.[name].[chunkhash].js",
        chunkFilename: "bundle.[name].[chunkhash].js"
    },
    resolve: {
        modules: [node_modules],
        extensions: ['.Webpack.js', '.web.js', '.ts', '.js', '.tsx'],

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
           { test: /\.json?$/, use: [{ loader: 'json-loader' }] },
           //{ test: /\.jsx?$/, use: [{ loader: "babel-loader"  }] },
           {
               test: /\.css$/,
               use: [
                   { loader: "style-loader" },
                   { loader: "css-loader" }
               ]
           },
           {
               test: /\.less$/,
               use: [
                   { loader: "style-loader" },
                   { loader: "css-loader" },
                   { loader: "less-loader" }
               ]
           },
           { test: /\.gif$/, use: [{ loader: "url-loader", options: { "mimetype": "image/gif" } }] },
           { test: /\.png$/, use: [{ loader: "url-loader", options: { "mimetype": "image/png" } }] },
           { test: /\.woff(2)?(\?v=[0-9].[0-9].[0-9])?$/, use: [{ loader: "url-loader", options: { "mimetype": "application/font-woff" } }] },
           { test: /\.(ttf|eot|svg)(\?.*)?$/, use: [{ loader: "file-loader", options: { "name": "[name].[ext]" } }] }
        ]
    },
    plugins: [
        new webpack.DllReferencePlugin({
            context: path.join(__dirname, "App"),
            manifest: require("./dist/vendor-manifest.json")
        }),
        //new webpack.OldWatchingPlugin(), //makes watch-mode reliable in Visual Studio!
        //new webpack.optimize.UglifyJsPlugin(),
        new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /(en|es)/),
        new AssetsPlugin({
            path: path.join(__dirname, 'dist')
        }),
        new WebpackNotifierPlugin({ alwaysNotify: true }),
        new CopyWebpackPlugin([
            { from: 'node_modules/es6-promise/dist/es6-promise.auto.min.js', to: path.join(__dirname, 'dist/es6-promise.auto.min.js') },
            { from: 'node_modules/whatwg-fetch/fetch.js', to: path.join(__dirname, 'dist/fetch.js') },
        ])
    ],
    //devtool: "source-map",
}