var path = require("path");
var webpack = require("webpack");
var AssetsPlugin = require('assets-webpack-plugin');

module.exports = {
    entry: {
        vendor: [path.join(__dirname, "App", "vendors.js")]
    },
    output: {
        path: path.join(__dirname, "dist"),
        filename: "dll.[name].[hash].js",
        library: "[name]_[hash]"
    },
    plugins: [
        new webpack.DllPlugin({
            path: path.join(__dirname, "dist", "[name]-manifest.json"),
            name: "[name]_[hash]",
            context: path.resolve(__dirname, "App")
        }),
        new AssetsPlugin({
            path: path.join(__dirname, 'dist'),
            filename: "webpack-assets.dll.json"
        }),
        //new webpack.optimize.OccurenceOrderPlugin()//,
        //new webpack.optimize.UglifyJsPlugin()
    ],
    resolve: {
        modules: [
            "node_modules"
        ],
        alias: { //https://github.com/jquense/react-widgets/issues/559
            "react-component-managers": path.resolve(__dirname, "./node_modules/react-component-managers"),
            "react-overlays": path.resolve(__dirname, "./node_modules/react-overlays")
        }
    }
};
