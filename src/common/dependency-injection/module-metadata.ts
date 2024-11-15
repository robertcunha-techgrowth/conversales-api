import { globalTarget } from "./global-target";
import { BaseServiceProvider } from "./provider";

export class ModuleMetadata {
	// Method to retrieve module metadata (no changes needed here)
	public getModuleMetadata(name: string) {
		const providers: Record<string, any> = Reflect.getMetadata(
			`${name}:providers`,
			globalTarget
		);
		const imports = Reflect.getMetadata(`${name}:imports`, globalTarget);
		const exports: BaseServiceProvider[] = Reflect.getMetadata(
			`${name}:exports`,
			globalTarget
		);

		const controllers: Record<string, any> = Reflect.getMetadata(
			`${name}:controllers`,
			globalTarget
		);

		return {
			providers,
			controllers,
			imports,
			exports,
		};
	}

	// Method to retrieve an instance of a provider
	public getServiceInstance(moduleName: string, provide: string) {
		return Reflect.getMetadata(
			`${moduleName}:provider:${provide}`,
			globalTarget
		);
	}

	public getControllerInstance(moduleName: string, provide: string) {
		return Reflect.getMetadata(
			`${moduleName}:controller:${provide}`,
			globalTarget
		);
	}

	// Method to set provider metadata
	public setProviderMetadata(
		moduleName: string,
		provide: string,
		instance: any
	) {
		const tag = `${moduleName}:provider:${provide}`;
		Reflect.defineMetadata(tag, instance, globalTarget);
		return tag;
	}

	// Method to get provider metadata (no changes needed here)
	public getProviderMetadata(moduleName: string, provide: string) {
		return Reflect.getMetadata(
			`${moduleName}:provider:${provide}`,
			globalTarget
		);
	}
}
