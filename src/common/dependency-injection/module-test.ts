import { ModuleHandlerOptions } from "./module";
import { ModuleMetadata } from "./module-metadata";
import { BaseServiceProvider } from "./provider";

export class ModuleHandlerTest {
	private moduleMetadata: ModuleMetadata;

	constructor(private readonly moduleProps: ModuleHandlerOptions) {
		this.moduleMetadata = new ModuleMetadata();
	}

	public get<T>(moduleName: string, providerName: string): T {
		const providers =
			this.moduleMetadata.getModuleMetadata(moduleName).providers;
		const provider = providers[providerName] as T;
		return provider;
	}
}
