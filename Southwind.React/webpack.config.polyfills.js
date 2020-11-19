var path = require("path");
var webpack = require("webpack");
var AssetsPlugin = require('assets-webpack-plugin');

module.exports = {
  mode: "development",  //Now mandatory, alternatively �production�
  devtool: false, //To remove source maps in �development�, avoids problems with errors in Chrome
  entry: {
    polyfills: [path.join(__dirname, "App", "polyfills.js")]
  },
  output: {
    path: path.join(__dirname, "wwwroot", "dist"),
    filename: "[name].[hash].js",
    library: "[name]_[hash]"
  },
  plugins: [
    new AssetsPlugin({
      path: path.join(__dirname, "wwwroot", "dist"),
      filename: "webpack-assets.polyfills.json"
    }),
  ],
  resolve: {
    modules: [
      "node_modules"
    ]
  }
};
