var path = require("path");
var webpack = require("webpack");

module.exports = {
    entry: {
        vendor: [path.join(__dirname, "ClientApp", "vendors.js")]
    },
    output: {
        path: path.join(__dirname, "wwwroot/dist"),
        filename: "dll.[name].[hash].js",
        library: "[name]_[hash]"
    },
    plugins: [
        new webpack.DllPlugin({
            path: path.join(__dirname, "wwwroot/dist", "[name]-manifest.json"),
            name: "[name]_[hash]",
            context: path.resolve(__dirname, "ClientApp")
        })
    ],
    resolve: {
        modules: [
            "node_modules"
        ]
    }
};
