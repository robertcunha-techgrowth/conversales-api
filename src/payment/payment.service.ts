import { Model } from "mongoose";
import { Inject } from "../common/dependency-injection/inject";
import { Injectable } from "../common/dependency-injection/injectable";
import { Payment } from "./payment.entity";
import { AxiosInstance } from "axios";

export interface CobData {
	calendario: {
		expiracao: 3600;
	};
	devedor: {
		cnpj: "12345678000195";
		nome: "Empresa de Serviços SA";
	};
	valor: {
		original: "37.00";
	};
	chave: "ac107ed7-97cd-4fe7-8df5-a5f5659bf2f3";
	solicitacaoPagador: "Serviço realizado.";
	infoAdicionais: [
		{
			nome: "Campo 1";
			valor: "Informação Adicional1 do PSP-Recebedor";
		},
		{
			nome: "Campo 2";
			valor: "Informação Adicional2 do PSP-Recebedor";
		}
	];
}

@Injectable()
export class PaymentService {
	constructor(
		@Inject("PaymentModel") private readonly model: Model<Payment>,
		@Inject("PaymentAxios") private readonly axios: AxiosInstance
	) {}

	async create(payment: Payment) {
		const paymentCreated = await this.model.create(payment);
		return paymentCreated.toObject();
	}

	async createPix(cobData: CobData) {
		const bearerToken = await this.getBearerToken();
		const response = await this.axios.post("/pix", cobData, {
			headers: {
				Authorization: bearerToken,
			},
		});
		return response.data;
	}

	private async getBearerToken(): Promise<string> {
		return `Bearer ${process.env.EFI_TOKEN}`;
	}
}
