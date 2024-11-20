import mongoose from "mongoose";
import { SchemaFactory } from "../common/database/schema.factory";
import { Ticket } from "../ticket/ticket.entity";
import { Prop } from "../common/database/prop.decorator";
import { Schema } from "../common/database/schema.decorator";

@Schema({
	timestamps: true,
})
export class Payment {
	@Prop({
		type: mongoose.Types.ObjectId,
		ref: Ticket.name,
		required: true,
	})
	ticketId: mongoose.Types.ObjectId | Ticket;
}

export const PaymentSchema = SchemaFactory.createFromClass(Payment);
