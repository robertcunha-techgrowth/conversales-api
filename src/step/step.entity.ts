import { Prop } from "../common/database/prop.decorator";
import { Schema } from "../common/database/schema.decorator";
import { SchemaFactory } from "../common/database/schema.factory";

@Schema({
	id: false,
})
export class StepTexts {
	@Prop({
		type: String,
		required: true,
	})
	"200": string;

	@Prop({
		type: String,
		required: true,
	})
	"400": string;
}

export const StepTextsSchema = SchemaFactory.createFromClass(StepTexts);

export enum StepKind {
	COLLECT_DATA_STEP = "COLLECT_DATA_STEP",
	INTRO_STEP = "INTRO_STEP",
	LIST_PRODUCTS_STEP = "LIST_PRODUCTS_STEP",
	SELECTED_PRODUCT_STEP = "SELECTED_PRODUCT_STEP",
	CHECKOUT_STEP = "CHECKOUT_STEP",
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
		type: StepTextsSchema, // Reference the schema here
		required: true,
	})
	texts: StepTexts;

	@Prop({
		type: Boolean,
		default: () => true,
		required: true,
	})
	isFirstStep: boolean;

	@Prop({
		type: Boolean,
		required: true,
	})
	isFinalStep: boolean;

	@Prop({
		type: Number,
		default: null,
	})
	conditionalToFinish?: number;

	@Prop({
		type: String,
	})
	userProperty?: string;

	@Prop({
		type: Number,
		default: null,
	})
	stepReturn?: number;

	@Prop({
		type: String,
		required: true,
	})
	kind: StepKind;

	@Prop({
		type: Number,
		default: null,
	})
	nextStep?: number;
}

export const StepSchema = SchemaFactory.createFromClass(Step);
