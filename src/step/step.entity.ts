import { Prop } from "../common/database/prop.decorator";
import { Schema } from "../common/database/schema.decorator";
import { SchemaFactory } from "../common/database/schema.factory";

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
	rules: string;

	@Prop({
		type: Object,
		required: true,
	})
	texts: {
		"200": string;
		"400": string;
	};

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
}

export const StepSchema = SchemaFactory.createFromClass(Step);
