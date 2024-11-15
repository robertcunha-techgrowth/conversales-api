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
		required: true,
	})
	_id: mongoose.Types.ObjectId;

	@Prop({
		type: String,
		required: true,
	})
	documentId: string;

	@Prop({
		type: StatusTicket,
		required: true,
	})
	status: StatusTicket;

	@Prop({
		type: String,
		required: true,
		default: (): OpenAI.Chat.Completions.ChatCompletionMessageParam[] => {
			return [];
		},
	})
	history: OpenAI.Chat.Completions.ChatCompletionMessageParam[];

	@Prop({
		type: String,
		required: true,
	})
	userPhone: string;

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
		required: true,
	})
	retryCount: number;

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
		type: [Product],
		required: false,
	})
	product?: Product[];

	@Prop({
		type: String,
		required: true,
	})
	channel: string;
}

export const TicketSchema = SchemaFactory.createFromClass(Ticket);
