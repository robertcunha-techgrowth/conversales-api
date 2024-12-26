import { AxiosInstance } from "axios";
import mongoose, { Model } from "mongoose";
import { Inject } from "../../common/dependency-injection/inject";
import { Payment } from "./payment.entity";
import { PixPayment } from "./pix-payment.entity";
import {
	CobData,
	EfiPixResponse,
	PaymentDomainService,
} from "./payment.service";
import { EndToEndPix } from "../infrastructure/types";

export class PixPaymentDomainService extends PaymentDomainService {
	constructor(
		@Inject("PaymentPixModel") model: Model<Payment>,
		@Inject("PaymentAxios") axios: AxiosInstance
	) {
		super(model, axios);
	}

	override async create(cobData: CobData, token: string, ticketId: string) {
		const response = await this.createPaymentOnEfi(cobData, token);
		const payment: PixPayment = {
			ticket: new mongoose.Types.ObjectId(ticketId),
			pixCopyAndPaste: response.pixCopiaECola,
			externalTransactionId: response.txid,
		};
		return this.createInDatabase(payment);
	}

	private async createPaymentOnEfi(
		cobData: CobData,
		token: string
	): Promise<EfiPixResponse> {
		const response = await this.axios.post("/cob", cobData, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
		return response.data;
	}

	async checkEndToEndPix(endToEndId: string): Promise<EndToEndPix> {
		try {
			const response = await this.axios.get(`/v2/pix/${endToEndId}`);
			return response.data;
		} catch (err: any) {
			console.log(err);
			throw {
				message: err.response.data.mensagem,
				statusCode: err.response.status,
			};
		}
	}
}
