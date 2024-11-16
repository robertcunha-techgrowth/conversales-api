module.exports = {
	preset: "ts-jest", // Usa o ts-jest para processar TypeScript
	testEnvironment: "node",
	transform: {
		"^.+\\.(ts|tsx)$": ["ts-jest", { babelConfig: true }], // Integra Babel e ts-jest
	},
	transformIgnorePatterns: ["/node_modules/"], // Garante que dependências externas sejam ignoradas
	moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
};
