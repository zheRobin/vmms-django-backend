const webpack = require('webpack');
const path = require('path');

module.exports = {
  mode: 'production',

  context: __dirname,

  entry: {
    client: __dirname + '/projects/client/src/main.ts',
    management: __dirname + '/projects/management/src/main.ts',
    music: __dirname + '/projects/music/src/main.ts',
  },

  resolve: {
    extensions: [".ts", ".tsx", ".js"],
    extensionAlias: {
      ".js": [".js", ".ts"],
      ".cjs": [".cjs", ".cts"],
      ".mjs": [".mjs", ".mts"]
    }
  },
  module: {
    rules: [
      { test: /\.([cm]?ts|tsx)$/, loader: "ts-loader" },
      {
        test: /\.html$/,
        use: 'html-loader'
      },
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        use: [
          'css-to-string-loader',
          {loader: 'css-loader', options: {sourceMap: true}},
          {loader: 'sass-loader', options: {sourceMap: true}}
        ]
      },
    ]
  },

  plugins: [

  ],

  output: {
    path: __dirname + '/static',
    filename: '[name].bundle.js',
    publicPath: '/static/'
  }
};
