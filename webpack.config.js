const path = require('path');

module.exports = {
  mode: 'development',
  entry: {
    main: './src/index.ts',
    // worker: './src/Workers/OffScreenWorker.ts'
    worker: './src/Workers/OffScreenStl.ts'
  },
  output: {
    path: `${__dirname}/dist`
  },
  module: {
    rules: [
      {
        exclude: /node_modules/,
        test: /\.ts$/,
        use: 'ts-loader'
      },
      {
        test: /\.(frag|vert|glsl)$/,
        use: [
          {
            loader: 'webpack-glsl-loader',
            options: {}
          }
        ]
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  devServer: {
    contentBase: path.resolve(__dirname, './src'),
    watchContentBase: true,
    port: 5000,
    open: true,
    openPage: './index.html'
  }
};
