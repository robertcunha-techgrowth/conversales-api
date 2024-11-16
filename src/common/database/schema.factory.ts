import mongoose, { SchemaOptions } from "mongoose";
import { globalTarget } from "../dependency-injection/global-target";

export class SchemaFactory {
	static createFromClass(target: any) {
		const options = Reflect.getMetadata(
			`mongoose:schema:options:${target.name}`,
			target
		);
		const keys = Object.keys(new target());
		const schemaKeys = keys.reduce<Record<string, SchemaOptions>>(
			(prev, key) => {
				const schemaOptions = Reflect.getMetadata(
					`${target.name}:${key}`,
					globalTarget
				);
				prev = { ...prev, ...schemaOptions };
				return prev;
			},
			{}
		);
		return new mongoose.Schema(schemaKeys, options);
	}
}
