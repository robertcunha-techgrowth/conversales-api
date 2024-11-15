const path = require("path");
const nodeExternals = require("webpack-node-externals");

module.exports = {
	entry: "./src/index.ts", // Adjust this if needed
	target: "node",
	externals: [nodeExternals()],
	mode: "production",
	resolve: {
		extensions: [".js", ".ts"],
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				loader: "ts-loader",
				exclude: /node_modules/,
			},
		],
	},
	output: {
		libraryTarget: "commonjs",
		path: path.resolve(__dirname, ".webpack"),
		filename: "[name].js",
	},
};
