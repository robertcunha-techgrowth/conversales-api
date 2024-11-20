import mongoose from "mongoose";
import { Prop } from "../common/database/prop.decorator";
import { Schema } from "../common/database/schema.decorator";
import { SchemaFactory } from "../common/database/schema.factory";

@Schema({
	timestamps: true,
})
export class Product {
	@Prop({
		type: mongoose.Types.ObjectId,
		default: () => new mongoose.Types.ObjectId(),
	})
	_id?: mongoose.Types.ObjectId;

	@Prop({
		type: String,
		required: true,
	})
	name: string;

	@Prop({
		type: Number,
		required: true,
	})
	price: number;

	@Prop({
		type: String,
		required: true,
	})
	description: string;

	@Prop({
		type: Number,
	})
	num: number;
}

export const ProductSchema = SchemaFactory.createFromClass(Product);
