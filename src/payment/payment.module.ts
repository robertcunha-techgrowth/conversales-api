import mongoose from "mongoose";
import { ModuleHandler } from "../common/dependency-injection/module";
import {
	ClassProvider,
	FactoryProvider,
} from "../common/dependency-injection/provider";
import { Payment, PaymentSchema } from "./payment.entity";
import axios from "axios";
import { PaymentService } from "./payment.service";
import fs from "fs";
import https from "https";

export const PaymentModelProvider = new FactoryProvider({
	provide: "PaymentModel",
	useFactory: () => {
		return mongoose.model(Payment.name, PaymentSchema);
	},
});

export const PaymentAxiosProvider = new FactoryProvider({
	provide: "PaymentAxios",
	useFactory: () => {
		const certificado = fs.readFileSync(process.env.EFI_CERTIFICATE_PATH);

		const agent = new https.Agent({
			pfx: certificado,
			passphrase: "",
		});

		return axios.create({
			baseURL: process.env.EFI_BASE_URL,
			httpsAgent: agent,
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
