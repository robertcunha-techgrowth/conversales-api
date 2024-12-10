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
		cnpj: string;
		nome: string;
	};
	valor: {
		original: string;
	};
	chave: string;
	solicitacaoPagador: string;
	infoAdicionais?: [
		{
			nome: string;
			valor: string;
		}
	];
}

export interface EfiPixResponse {
	calendario: {
		criacao: string;
		expiracao: number;
	};
	txid: string;
	revisao: number;
	loc: {
		id: number;
		location: string;
		tipoCob: string;
	};
	location: string;
	status: string;
	devedor: {
		cnpj: string;
		nome: string;
	};
	valor: {
		original: "567.89";
	};
	chave: string;
	solicitacaoPagador: string;
	pixCopiaECola: string;
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

	async createPayment(
		cobData: CobData,
		token: string
	): Promise<EfiPixResponse> {
		const response = await this.axios.post("/pix", cobData, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
		return response.data;
	}
}
