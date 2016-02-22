/// <binding />
"use strict";
var path = require('path');
var webpack = require('webpack');
var CleanWebpackPlugin = require('clean-webpack-plugin');
var AssetsPlugin = require('assets-webpack-plugin');

console.log(process.version);

module.exports = {
    entry: {
        main: [
            "./Scripts/Main.tsx", 
            "../Framework/Signum.React/Scripts/Lines",
            "../Framework/Signum.React/Scripts/Frames/PageFrame",
            "../Framework/Signum.React/Scripts/Frames/ModalFrame",
            "../Framework/Signum.React/Scripts/SearchControl/SearchPage", 
            "../Framework/Signum.React/Scripts/SearchControl/SearchModal"],
        "react": ["react", "react-bootstrap", "react-router", "react-widgets", "react-router-bootstrap"],
        "moment": ["moment"],
        //"lines": []
        //"d3": ["d3"],
    },
    output: {
        path: path.join(__dirname, "dist"),
        filename: "bundle.[name].[chunkhash].js",
        chunkFilename: "bundle.[name].[chunkhash].js"
    },
    resolve: {
        root: path.join(__dirname, "node_modules"),
        extensions: ['', '.Webpack.js', '.web.js', '.ts', '.js', '.tsx']
    },
    resolveLoader: { root: path.join(__dirname, "node_modules") },
    module: {
        loaders: [
            { test: /\.tsx?$/, loader: 'ts-loader' },
            //{ test: /\.jsx?$/, loader: "babel-loader" }
            { test: /\.css$/, loader: "style-loader!css-loader" },
            { test: /\.less$/, loader: "style-loader!css-loader!less-loader" },
            { test: /\.gif$/, loader: "url-loader?mimetype=image/png" },
            { test: /\.woff(2)?(\?v=[0-9].[0-9].[0-9])?$/, loader: "url-loader?mimetype=application/font-woff" },
            { test: /\.(ttf|eot|svg)(\?v=[0-9].[0-9].[0-9])?$/, loader: "file-loader?name=[name].[ext]" },
        ]
    },
    plugins: [
        new webpack.optimize.CommonsChunkPlugin({
            names: ['react', 'moment'],
            minChunks : Infinity
        }),
        new CleanWebpackPlugin(['dist'], {
            //root: '/full/project/path',
            verbose: true,
            dry: false
        }),
        new AssetsPlugin({
            path: path.join(__dirname, 'dist')
        })
    ],

    ts: {
        compilerOptions: {
            "noEmit": false
        }
    }
}