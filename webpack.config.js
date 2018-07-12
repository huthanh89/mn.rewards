//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

var path = require('path');

//-----------------------------------------------------------------------------
// Exports
//-----------------------------------------------------------------------------

module.exports = {
  output: {
    filename: 'bundle.js'
  },
  resolve: {
    alias: {
      gin: path.resolve(__dirname, 'static/'),
      'gin.png': path.resolve(__dirname, 'static/asset/'),
    }
  },
  module: {
    rules: [
      {
        test: /\.pug/,
        loaders: ['html-loader', 'pug-html-loader']
      },
      {
        test: /\.png/,
        use: [
          {
            loader: 'file-loader',
            options: {
         //     publicPath: __dirname + '/static/asset/',
//              useRelativePath:  __dirname + '/static/asset/',
              path: './sattic/'
            }
          }
        ]
      }
    ]
  }

};