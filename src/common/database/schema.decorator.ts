import mongoose, { SchemaOptions } from "mongoose";

export const Schema = (options?: SchemaOptions): ClassDecorator => {
	return (target) => {
		Reflect.defineMetadata(
			`mongoose:schema:options:${target.name}`,
			options,
			target
		);
	};
};
