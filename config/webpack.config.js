const webpack = require('webpack');


module.exports = {
    entry: {
        management: __dirname + '/../frontend/management/boot.js',
        music: __dirname + '/../frontend/music/boot.js',
        client: __dirname + '/../frontend/client/boot.js'
    },
    output: {
        path: __dirname + '/../app/vmms/static',
        filename: '[name].bundle.js',
        publicPath: '/static/'
    },
    resolve: {
        modules: [
          'node_modules'
        ]    
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['env'],
                        plugins: ['angularjs-annotate']
                    }
                }
            },
            {
                test: /\.(gif|png|jpe?g|svg)$/,
                use: [
                    'file-loader',
                    {
                        loader: 'image-webpack-loader',
                        options: {
                            bypassOnDebug: true,
                        },
                    },
                ],
            },
            { test: /\.jade$/, use: "jade-loader" },
            { test: /\.css$/, use: [ "style-loader", "css-loader" ] },
            { test: /\.eot$/, use: 'url-loader?limit=100000&mimetype=application/vnd.ms-fontobject' },
            { test: /\.woff2$/, use: 'url-loader?limit=100000&mimetype=application/font-woff2' },
            { test: /\.woff$/, use: 'url-loader?limit=100000&mimetype=application/font-woff' },
            { test: /\.ttf$/, use: 'url-loader?limit=100000&mimetype=application/font-ttf' },
            { test: /\.svg$/, use: 'url-loader?limit=100000&mimetype=application/font-svg' }
        ]
    },
    plugins: [
        new webpack.ProvidePlugin({
           "$": "jquery",
           "jQuery": "jquery",
           "window.jQuery": "jquery",
           "Masonry": "masonry-layout"
        })
    ]
};