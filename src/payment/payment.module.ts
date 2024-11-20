import mongoose from "mongoose";
import { ModuleHandler } from "../common/dependency-injection/module";
import { FactoryProvider } from "../common/dependency-injection/provider";
import { Payment, PaymentSchema } from "./payment.entity";
import axios from "axios";

const PaymentModelProvider = new FactoryProvider({
	provide: "PaymentModel",
	useFactory: () => {
		return mongoose.model(Payment.name, PaymentSchema);
	},
});

const PaymentAxiosProvider = new FactoryProvider({
	provide: "PaymentAxios",
	useFactory: () => {
		return axios.create({
			baseURL: process.env.EFI_BASE_URL,
		});
	},
});

@ModuleHandler({
	providers: [PaymentModelProvider],
})
export class PaymentModule {}
