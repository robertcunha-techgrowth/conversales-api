import mongoose from "mongoose";
import { Prop } from "../common/database/prop.decorator";
import { Schema } from "../common/database/schema.decorator";
import { SchemaFactory } from "../common/database/schema.factory";

@Schema({
	timestamps: true,
})
export class Company {
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
		type: String,
		required: true,
	})
	nationalId: string;

	@Prop({
		type: String,
		required: true,
	})
	email: string;

	@Prop({
		type: String,
		default: null,
	})
	password?: string;

	@Prop({
		type: String,
		default: null,
	})
	activationCode?: string;

	@Prop({
		type: String,
		default: null,
	})
	keyPix?: string;

	@Prop({
		type: String,
		default: null,
	})
	cellphone?: string;
}

export const CompanySchema = SchemaFactory.createFromClass(Company);
