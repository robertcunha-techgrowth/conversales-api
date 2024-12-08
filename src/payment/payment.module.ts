import mongoose from "mongoose";
import { ModuleHandler } from "../common/dependency-injection/module";
import {
	ClassProvider,
	FactoryProvider,
} from "../common/dependency-injection/provider";
import { Payment, PaymentSchema } from "./payment.entity";
import axios from "axios";
import { PaymentService } from "./payment.service";

export const PaymentModelProvider = new FactoryProvider({
	provide: "PaymentModel",
	useFactory: () => {
		return mongoose.model(Payment.name, PaymentSchema);
	},
});

export const PaymentAxiosProvider = new FactoryProvider({
	provide: "PaymentAxios",
	useFactory: () => {
		return axios.create({
			baseURL: process.env.EFI_BASE_URL,
		});
	},
});

export const PaymentServiceProvider = new ClassProvider({
	provide: PaymentService.name,
	useClass: PaymentService,
});

@ModuleHandler({
	providers: [
		PaymentModelProvider,
		PaymentAxiosProvider,
		PaymentServiceProvider,
	],
	exports: [PaymentModelProvider, PaymentAxiosProvider, PaymentServiceProvider],
})
export class PaymentModule {}
