import { Model } from "mongoose";
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

export abstract class PaymentDomainService {
	constructor(
		protected readonly model: Model<Payment>,
		protected readonly axios: AxiosInstance
	) {}

	protected async createInDatabase(payment: Payment) {
		const paymentCreated = await this.model.create(payment);
		return paymentCreated.toObject();
	}

	abstract create(
		cobData: CobData,
		token: string,
		ticketId: string
	): Promise<Payment>;
}
