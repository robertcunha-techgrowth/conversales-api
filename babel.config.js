module.exports = {
	presets: [
		"@babel/preset-env", // Transpila para versões mais antigas do JavaScript
		"@babel/preset-typescript", // Adiciona suporte a TypeScript
	],
	plugins: [
		[
			"@babel/plugin-proposal-decorators",
			{ legacy: true }, // Suporte ao padrão mais recente de decoradores
		],
		"@babel/plugin-proposal-class-properties", // Suporte para propriedades de classe
	],
};
