import * as dotenv from "dotenv";
import { globalTarget } from "../dependency-injection/global-target";
import "reflect-metadata";

export interface ConfigModuleRootParams {
	envFilePath: string;
	isGlobal: boolean;
}

export class ConfigModule {
	static forRoot({ envFilePath, isGlobal }: ConfigModuleRootParams) {
		if (isGlobal) {
			const configModule = new ConfigModule();
			Reflect.defineMetadata("globals:config", configModule, globalTarget);
		}

		dotenv.config({
			path: envFilePath,
		});
	}

	get<T>(key: string): T {
		return process.env[key] as T;
	}
}
