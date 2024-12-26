import mongoose from "mongoose";
import { ModuleHandler } from "../../common/dependency-injection/module";
import {
	ClassProvider,
	FactoryProvider,
} from "../../common/dependency-injection/provider";
import { Payment, PaymentSchema } from "../domain/payment.entity";
import axios from "axios";
import fs from "fs";
import https from "https";
import { PixPayment, PixPaymentSchema } from "../domain/pix-payment.entity";
import { PixPaymentDomainService } from "../domain/pix-payment.service";

export const PaymentModelProvider = new FactoryProvider({
	provide: "PaymentPixModel",
	useFactory: () => {
		const model = mongoose.model(Payment.name, PaymentSchema);
		return model.discriminator(PixPayment.name, PixPaymentSchema, "PixPayment");
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

export const PixPaymentServiceProvider = new ClassProvider({
	provide: PixPaymentDomainService.name,
	useClass: PixPaymentDomainService,
});

@ModuleHandler({
	providers: [
		PaymentModelProvider,
		PaymentAxiosProvider,
		PixPaymentServiceProvider,
	],
	exports: [
		PaymentModelProvider,
		PaymentAxiosProvider,
		PixPaymentServiceProvider,
	],
})
export class PaymentModule {}
