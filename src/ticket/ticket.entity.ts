import mongoose from "mongoose";
import OpenAI from "openai";
import { Product, ProductSchema } from "../product/product.entity";
import { Schema } from "../common/database/schema.decorator";
import { SchemaFactory } from "../common/database/schema.factory";
import { Prop } from "../common/database/prop.decorator";
import { ChatBotHistory, InputStepParams } from "../chatbot/chatbot";
import { StepKind } from "../step/step.entity";
import { Company } from "../company/company.entity";

export enum StatusTicket {
	Active = "ACTIVE",
	Buyed = "BUYED",
	Closed = "CLOSED",
	Abandoned = "ABANDONED",
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

	@Prop({
		type: String,
		default: null,
	})
	cellphone?: string;

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
		default: () => 3,
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

	@Prop({
		type: Object,
		default: null,
	})
	previousInput?: {
		rule: string;
		params: InputStepParams;
	};

	@Prop({
		type: mongoose.Types.ObjectId,
		ref: Company.name,
	})
	company?: mongoose.Types.ObjectId | Company;

	@Prop({
		type: String,
		default: null,
	})
	threadId?: string;

	@Prop({
		type: Number,
		default: null,
	})
	rateService?: number;

	@Prop({
		type: Date,
		default: null,
	})
	lastResponse?: Date;

	@Prop({
		type: Boolean,
		default: true,
	})
	sendNotify?: boolean;
}

export const TicketSchema = SchemaFactory.createFromClass(Ticket);
