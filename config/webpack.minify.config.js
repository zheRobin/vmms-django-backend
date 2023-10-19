const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

let config = require('./webpack.config.js');

config.plugins.push(new UglifyJsPlugin());

module.exports = config;