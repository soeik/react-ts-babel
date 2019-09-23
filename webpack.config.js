const CopyWebpackPlugin = require("copy-webpack-plugin")
const CompressionPlugin = require("compression-webpack-plugin")
const TerserPlugin = require("terser-webpack-plugin")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const webpack = require("webpack")
const path = require("path")

require("@babel/polyfill")

const getDefaultConfig = (production) => ({
    mode: "development",
    context: path.resolve(__dirname, "src"),
    entry: ["./index.tsx"],
    output: {
        path: path.resolve(__dirname, "./dist"),
        filename: "index.js",
    },
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,

                        options: {
                            hmr: !production,
                        },
                    },
                    "css-loader",
                    "sass-loader",
                ],
            },
            {
                test: /\.css$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,

                        options: {
                            hmr: !production,
                        },
                    },
                    "css-loader",
                ],
            },
            {
                test: /\.(png|woff|woff2|eot|ttf|svg)$/,
                loader: "url-loader?limit=100000",
            },
            {
                test: /\.(tsx?$)/,
                enforce: "pre",
                exclude: [/node_modules/],
                include: [/src/],
                loader: "eslint-loader",
                options: {
                    emitError: true,
                    failOnError: true,
                    fainOnWarning: false,
                },
            },
            {
                test: [/\.tsx?$/],
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        cacheDirectory: true,
                        babelrc: false,
                        presets: [
                            [
                                "@babel/preset-env",
                                {
                                    targets: {
                                        browsers: [
                                            "last 5 versions",
                                            "ie >= 11",
                                        ],
                                    },
                                },
                            ],
                            "@babel/preset-typescript",
                            "@babel/preset-react",
                        ],
                        plugins: ["react-hot-loader/babel"],
                    },
                },
            },
        ],
    },
    resolve: {
        extensions: [".js", ".ts", ".tsx", ".json"],
        alias: {
            app: path.resolve(__dirname, "src/app/"),
            domain: path.resolve(__dirname, "src/domain/"),
        },
    },

    stats: { children: false },
    optimization: {
        minimizer: [
            new TerserPlugin({
                parallel: true,
                cache: true,
                sourceMap: true,
                extractComments: true,
                terserOptions: {
                    compress: {
                        drop_console: true,
                    },
                },
            }),
        ],
    },
    plugins: [
        new CopyWebpackPlugin([
            { from: "../public/index.html", to: "index.html" },
        ]),
        new MiniCssExtractPlugin({
            filename: "[name].css",
            chunkFilename: "[id].css",
        }),
        new CompressionPlugin({
            test: /\.js(\?.*)?$/i,
        }),
        new webpack.HotModuleReplacementPlugin(),
    ],
})

module.exports = ({
    production = false,
    host = "localhost",
    port = "9005",
} = {}) => {
    console.log(
        "Starting webpack in " + production
            ? "production"
            : "development" + " mode",
    )

    let config = getDefaultConfig(production)

    if (!production) {
        config.devtool = "source-map"
        config.devServer = {
            host,
            port,
            stats: "minimal",
            contentBase: path.join(__dirname, "./dist"),
            publicPath: "/",
            historyApiFallback: true,
            compress: true,
            hot: true,
        }
    } else {
        config.devtool = "none"
    }

    return config
}
