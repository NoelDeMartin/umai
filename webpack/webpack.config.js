const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const ESMPlugin = require('@purtuga/esm-webpack-plugin');

module.exports = {
    entry: path.resolve(__dirname, './src/inrupt.js'),
    mode: 'production',
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: 'inrupt.js',
        library: 'inrupt',
        libraryTarget: 'var',
    },
    plugins: [
        new CopyPlugin({
            patterns: [{
                from: './src/**/*.d.ts',
                to: '[name].[ext]',
            }],
        }),
        new ESMPlugin(),
    ],
};
