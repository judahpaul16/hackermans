const path = require('path');

module.exports = {
  entry: './src/js/main.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        // Image files handling
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/[hash][ext][query]'
        }
      },
      {
        // Video files handling
        test: /\.(mp4|webm|ogg)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/[hash][ext][query]'
        }
      },
      {
        // Audio files handling, specifically for MP3
        test: /\.mp3$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/[hash][ext][query]'
        }
      },
      {
        // JSON files handling
        test: /\.json$/,
        use: 'json-loader',
        type: 'javascript/auto'  // This ensures that the loader works as expected
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.json']
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  }
};
