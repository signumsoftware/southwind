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
        main: [ "./App/Main.tsx" ],
    },
    output: {
        path: path.join(__dirname, "dist"),
        filename: "bundle.[name].[chunkhash].js",
        chunkFilename: "bundle.[name].[chunkhash].js"
    },
    resolve: {
        root: node_modules,
        extensions: ['', '.Webpack.js', '.web.js', '.ts', '.js', '.tsx'],
        
    },
    resolveLoader: { root: path.join(__dirname, "node_modules") },
    module: {
        loaders: [
            { test: /\.tsx?$/, loader: 'ts-loader' },
            //{ test: /\.jsx?$/, loader: "babel-loader" }
            { test: /\.css$/, loader: "style-loader!css-loader" },
            { test: /\.less$/, loader: "style-loader!css-loader!less-loader" },
            { test: /\.gif$/, loader: "url-loader?mimetype=image/gif" },
            { test: /\.png$/, loader: "url-loader?mimetype=image/png" },
            { test: /\.woff(2)?(\?v=[0-9].[0-9].[0-9])?$/, loader: "url-loader?mimetype=application/font-woff" },
            { test: /\.(ttf|eot|svg)(\?v=[0-9].[0-9].[0-9])?$/, loader: "file-loader?name=[name].[ext]" },
        ]
    },
    plugins: [
        new webpack.DllReferencePlugin({
            context: path.join(__dirname, "App"),
            manifest: require("./dist/vendor-manifest.json")
        }),
        new webpack.OldWatchingPlugin(), //makes watch-mode reliable in Visual Studio!
        //new webpack.optimize.UglifyJsPlugin(),
        new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /(en|es)/),
        new AssetsPlugin({
            path: path.join(__dirname, 'dist')
        }),
        new WebpackNotifierPlugin({ alwaysNotify: true }),
        new CopyWebpackPlugin([
            { from: 'node_modules/es6-promise/dist/es6-promise.min.js', to: path.join(__dirname, 'dist/es6-promise.min.js') },
            { from: 'node_modules/whatwg-fetch/fetch.js', to: path.join(__dirname, 'dist/fetch.js') },
        ])
    ],
    //devtool: "source-map",
    ts: {
        transpileOnly: true,
        compilerOptions: {
            "noEmit": false
        }
    }
}