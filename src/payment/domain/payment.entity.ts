import mongoose from "mongoose";
import { SchemaFactory } from "../../common/database/schema.factory";
import { Ticket } from "../../ticket/ticket.entity";
import { Prop } from "../../common/database/prop.decorator";
import { Schema } from "../../common/database/schema.decorator";

export enum PaymentStatus {
	PENDING = "PENDING",
	PAID = "PAID",
	CANCELED = "EXPIRED",
}

@Schema({
	timestamps: true,
})
export class Payment {
	@Prop({
		type: String,
		default: () => new mongoose.Types.ObjectId(),
	})
	_id?: mongoose.Types.ObjectId;

	@Prop({
		type: mongoose.Types.ObjectId,
		ref: Ticket.name,
		required: true,
	})
	ticket: mongoose.Types.ObjectId | Ticket;

	@Prop({
		type: String,
		enum: PaymentStatus,
		default: PaymentStatus.PENDING,
	})
	status?: PaymentStatus;

	@Prop({
		type: Date,
		default: null,
	})
	expireDate?: Date;
}

export const PaymentSchema = SchemaFactory.createFromClass(Payment);
