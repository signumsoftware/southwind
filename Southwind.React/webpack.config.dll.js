var path = require("path");
var webpack = require("webpack");
var AssetsPlugin = require('assets-webpack-plugin');

module.exports = {
    mode: "development",  //Now mandatory, alternatively “production”
    devtool: false, //To remove source maps in “development”, avoids problems with errors in Chrome
    entry: {
        vendor: [path.join(__dirname, "ClientApp", "vendors.js")]
    },
    output: {
        path: path.join(__dirname, "wwwroot", "dist"),
        filename: "dll.[name].[hash].js",
        library: "[name]_[hash]"
    },
    plugins: [
        new webpack.DllPlugin({
            path: path.join(__dirname, "wwwroot",  "dist", "[name]-manifest.json"),
            name: "[name]_[hash]",
            context: path.resolve(__dirname, "ClientApp")
        }),
        new AssetsPlugin({
            path: path.join(__dirname, "wwwroot", "dist"),
            filename: "webpack-assets.dll.json"
        }),
        //new webpack.optimize.OccurenceOrderPlugin()//,
        //new webpack.optimize.UglifyJsPlugin()
    ],
    resolve: {
        modules: [
            "node_modules"
        ]
    }
};
