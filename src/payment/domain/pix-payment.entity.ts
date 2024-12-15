import { Prop } from "../../common/database/prop.decorator";
import { SchemaFactory } from "../../common/database/schema.factory";
import { Payment } from "./payment.entity";

export class PixPayment extends Payment {
	@Prop({
		type: String,
		required: true,
	})
	pixCopyAndPaste: string;

	@Prop({
		type: String,
		required: true,
	})
	externalTransactionId: string;
}

export const PixPaymentSchema = SchemaFactory.createFromClass(PixPayment);
