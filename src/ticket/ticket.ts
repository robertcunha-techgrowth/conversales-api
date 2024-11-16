import mongoose from "mongoose";
import OpenAI from "openai";
import { Product } from "../product/product.entity";
import { Schema } from "../common/database/schema.decorator";
import { SchemaFactory } from "../common/database/schema.factory";
import { Prop } from "../common/database/prop.decorator";

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
		default: (): OpenAI.Chat.Completions.ChatCompletionMessageParam[] => {
			return [];
		},
	})
	history?: OpenAI.Chat.Completions.ChatCompletionMessageParam[];

	@Prop({
		type: String,
		required: true,
	})
	from: string;

	@Prop({
		type: Boolean,
		default: () => true,
	})
	isFirstStep?: boolean;

	@Prop({
		type: Boolean,
		required: false,
		default: () => false,
	})
	isFinalStep?: boolean;

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
}

export const TicketSchema = SchemaFactory.createFromClass(Ticket);
