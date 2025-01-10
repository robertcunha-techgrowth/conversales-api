import { Prop } from "../common/database/prop.decorator";
import { Schema } from "../common/database/schema.decorator";
import { SchemaFactory } from "../common/database/schema.factory";

@Schema({
	timestamps: true,
})
export class ContactMessage {
	@Prop({
		type: String,
		required: true,
	})
	message: string;

	@Prop({
		type: String,
		required: true,
	})
	email: string;

	@Prop({
		type: String,
		required: true,
	})
	name: string;

	@Prop({
		type: Boolean,
		default: false,
	})
	isReaded: boolean;
}

export const ContactMessageSchema =
	SchemaFactory.createFromClass(ContactMessage);
