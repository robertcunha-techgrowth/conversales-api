import mongoose from "mongoose";
import { Prop } from "../common/database/prop.decorator";
import { Schema } from "../common/database/schema.decorator";
import { SchemaFactory } from "../common/database/schema.factory";
import { Menu, MenuSchema } from "../menu/menu.entity";
import { Company } from "../company/company.entity";

export enum StepKind {
	GREETING = "GREETING",
	LIST_PRODUCTS = "LIST_PRODUCTS",
	ADD_PRODUCT = "ADD_PRODUCT",
	CHECKOUT = "CHECKOUT",
	SET_PROPERTY = "SET_PROPERTY",
	DETECT_STEP = "DETECT_STEP",
	FINISH_CONTACT = "FINISH_CONTACT",
	PAYMENT = "PAYMENT",
	CONTACT_INFO = "CONTACT_INFO",
}
@Schema({
	timestamps: true,
})
export class Step {
	@Prop({
		type: Number,
		required: true,
	})
	stepNumber: number;

	@Prop({
		type: String,
		required: true,
	})
	rule: string;

	@Prop({
		type: String,
		required: true,
	})
	kind: StepKind;

	@Prop({
		type: MenuSchema,
		required: false,
	})
	menu?: Menu;

	@Prop({
		type: Number,
		required: false,
		default: null,
	})
	detectStepToRedirect?: number;

	@Prop({
		type: String,
		required: false,
		default: null,
	})
	property?: string;

	@Prop({
		type: Number,
		default: null,
	})
	chainedStep?: number;

	@Prop({
		type: mongoose.Types.ObjectId,
		ref: Company.name,
	})
	company: mongoose.Types.ObjectId | Company;
}

export const StepSchema = SchemaFactory.createFromClass(Step);
