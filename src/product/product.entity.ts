import { Prop } from "../common/database/prop.decorator";
import { Schema } from "../common/database/schema.decorator";
import { SchemaFactory } from "../common/database/schema.factory";

@Schema({
	timestamps: true,
})
export class Product {
	@Prop({
		type: String,
		required: true,
	})
	name: string;

	@Prop({
		type: String,
		required: true,
	})
	price: string;

	@Prop({
		type: String,
		required: true,
	})
	description: string;
}

export const ProductSchema = SchemaFactory.createFromClass(Product);
