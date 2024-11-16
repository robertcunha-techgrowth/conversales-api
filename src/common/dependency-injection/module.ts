// import { ControllerProvider } from "./controller-provider";
import { globalTarget } from "./global-target";
import { ModuleMetadata } from "./module-metadata";
import { BaseServiceProvider } from "./provider";

export interface ModuleOptions {
	imports?: any[];

	providers?: BaseServiceProvider[];

	exports?: BaseServiceProvider[];
}

export interface ModuleHandlerOptions extends ModuleOptions {
	controllers?: BaseServiceProvider[];
}

const getExportFromModule = (moduleName: string, provide: string) => {
	return Reflect.getMetadata(`export:${moduleName}:${provide}`, globalTarget);
};

export const findInstanceFromExportModule = (
	importedModules: string[],
	currentProvide: string
) => {
	return importedModules
		.map((moduleName) => getExportFromModule(moduleName, currentProvide))
		.filter((instance) => instance)
		.pop();
};

const setExports = (moduleName: string, exports: BaseServiceProvider[]) => {
	Reflect.defineMetadata(`${moduleName}:exports`, exports, globalTarget);
};

const setImportedModules = (module: any, moduleName: string) => {
	const moduleMetadata = new ModuleMetadata();
	const { exports: exportsFromImports } = moduleMetadata.getModuleMetadata(
		module.name
	);
	return exportsFromImports.map((exportedProvider) => {
		const instance = moduleMetadata.getServiceInstance(
			module.name,
			exportedProvider.provide as string
		);
		moduleMetadata.setProviderMetadata(
			moduleName,
			exportedProvider.provide as string,
			instance
		);
		return instance;
	});
};

export const ModuleHandler = (
	moduleOptions: ModuleHandlerOptions = {}
): ClassDecorator => {
	return (target: Function) => {
		const moduleName = target.name;
		const { providers, imports, exports } = moduleOptions;

		imports?.map((module) => setImportedModules(module, moduleName));

		const instancesAsObject = providers
			?.sort((a, b) => b.priority - a.priority)
			.reduce<Record<string, object>>((prev, provider) => {
				const instance = provider.createInstance(
					moduleName,
					provider.provide as string
				);
				const key = provider.provide as string;
				prev[key] = instance;
				return prev;
			}, {});

		Reflect.defineMetadata(
			`${moduleName}:providers`,
			instancesAsObject,
			globalTarget
		);

		setExports(target.name, exports ?? []);
	};
};
