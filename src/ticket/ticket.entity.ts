import mongoose from "mongoose";
import OpenAI from "openai";
import { Product, ProductSchema } from "../product/product.entity";
import { Schema } from "../common/database/schema.decorator";
import { SchemaFactory } from "../common/database/schema.factory";
import { Prop } from "../common/database/prop.decorator";
import { ChatBotHistory } from "../chatbot/chatbot";
import { StepKind } from "../step/step.entity";

export enum StatusTicket {
	Active = "ACTIVE",
	Buyed = "BUYED",
	Closed = "CLOSED",
}

@Schema({
	_id: false,
})
export class UserOnTicket {
	@Prop({
		type: String,
		default: null,
	})
	name?: string;

	@Prop({
		type: String,
		default: null,
	})
	nationalId?: string;

	@Prop({
		type: String,
		default: null,
	})
	email?: string;

	[key: string]: any;
}

const UserOnTicketSchema = SchemaFactory.createFromClass(UserOnTicket);

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
		type: [ProductSchema],
		required: false,
		// ref: Product.name,
		// default: (): mongoose.Types.ObjectId[] => {
		// 	return [] as mongoose.Types.ObjectId[];
		// },
	})
	products?: [Product];

	@Prop({
		type: [ProductSchema],
		ref: Product.name,
		default: (): Product[] => {
			return [];
		},
	})
	cart?: Product[];

	@Prop({
		type: String,
		required: true,
	})
	channel: string;

	@Prop({
		type: UserOnTicketSchema,
		default: () => {
			return {};
		},
	})
	user?: UserOnTicket;

	@Prop({
		type: String,
		default: null,
	})
	previousStep?: StepKind;
}

export const TicketSchema = SchemaFactory.createFromClass(Ticket);
