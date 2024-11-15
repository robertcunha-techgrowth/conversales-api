import mongoose, { SchemaOptions } from "mongoose";

export const Schema = (options?: SchemaOptions): ClassDecorator => {
	return (target) => {
		const metadata = Reflect.getMetadata(target.name, target);
		const schema = new mongoose.Schema(metadata, options);

		Reflect.defineMetadata(`mongooose:schema:options`, options, target);
		Reflect.defineMetadata(`mongooose:schema`, schema, target);
	};
};
