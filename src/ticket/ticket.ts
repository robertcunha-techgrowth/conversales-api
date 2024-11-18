import mongoose from "mongoose";
import OpenAI from "openai";
import { Product, ProductSchema } from "../product/product.entity";
import { Schema } from "../common/database/schema.decorator";
import { SchemaFactory } from "../common/database/schema.factory";
import { Prop } from "../common/database/prop.decorator";
import { ChatBotHistory } from "../chatbot/chatbot";

export enum StatusTicket {
	Active = "ACTIVE",
	Buyed = "BUYED",
	Closed = "CLOSED",
}

@Schema({
	timestamps: true,
})
export class Ticket {
	@Prop({
		type: mongoose.Types.ObjectId,
		default: () => {
			return new mongoose.Types.ObjectId();
		},
	})
	_id?: mongoose.Types.ObjectId;

	@Prop({
		type: String,
		required: true,
	})
	documentId: string;

	@Prop({
		type: String,
		required: true,
	})
	status: StatusTicket;

	@Prop({
		type: [Object],
		default: (): ChatBotHistory[] => {
			return [];
		},
	})
	history?: ChatBotHistory[];

	@Prop({
		type: String,
		required: true,
	})
	from: string;

	@Prop({
		type: Number,
		required: true,
	})
	currentStep: number;

	@Prop({
		type: Number,
		default: () => 10,
	})
	retryCount?: number;

	@Prop({
		type: Boolean,
		default: () => false,
	})
	isAway?: boolean;

	@Prop({
		type: String,
		required: false,
	})
	name?: string;

	@Prop({
		type: String,
		required: false,
	})
	email?: string;

	@Prop({
		type: [mongoose.Types.ObjectId],
		required: false,
		ref: Product.name,
	})
	product?: Product[];

	@Prop({
		type: String,
		required: true,
	})
	channel: string;

	@Prop({
		type: ProductSchema,
		ref: Product.name,
	})
	cart?: Product[];
}

export const TicketSchema = SchemaFactory.createFromClass(Ticket);
