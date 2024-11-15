import mongoose from "mongoose";

export class SchemaFactory {
	static createFromClass<T>(target: new () => T) {
		const options = Reflect.getMetadata(`mongooose:schema:`, target);
		const metadata = Reflect.getMetadata(target.name, target);
		return new mongoose.Schema(metadata, options);
	}
}
