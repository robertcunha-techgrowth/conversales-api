import mongoose from "mongoose";
import { SchemaProp } from "./prop.decorator";

export class SchemaFactory {
	static createFromClass<T>(target: new () => T) {
		const options = Reflect.getMetadata(
			`mongoose:schema:options:${target.name}`,
			target
		);
		const keys = Object.keys(target);
		const schemaKeys = keys.reduce<Record<string, SchemaProp>>((prev, key) => {
			return (prev[key] = Reflect.getMetadata(`${target.name}:${key}`, target));
		}, {});
		console.log(schemaKeys);
		return new mongoose.Schema(schemaKeys, options);
	}
}
