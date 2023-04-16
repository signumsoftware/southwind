var path = require("path");
var webpack = require("webpack");
var AssetsPlugin = require('assets-webpack-plugin');
//const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  mode: "development",  //Now mandatory, alternatively “production”
  devtool: false, //To remove source maps in “development”, avoids problems with errors in Chrome
  entry: {
    vendor: [path.join(__dirname, "App", "vendors.js")]
  },
  output: {
    path: path.join(__dirname, "wwwroot", "dist"),
    filename: "dll.[name].[fullhash].js",
    library: "[name]_[fullhash]"
  },
  plugins: [
    //new BundleAnalyzerPlugin(),
    new webpack.DllPlugin({
      path: path.join(__dirname, "wwwroot", "dist", "[name]-manifest.json"),
      name: "[name]_[fullhash]",
      context: path.resolve(__dirname, "App"),
      entryOnly: false,
    }),
    new AssetsPlugin({
      fullPath: false,
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
