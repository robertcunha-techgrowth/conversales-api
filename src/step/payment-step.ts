import {
	SecretsManagerClient,
	GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";
import { OutputTaskInterpretation } from "../chatbot/chatbot";
import { Injectable } from "../common/dependency-injection/injectable";
import { Ticket } from "../ticket/ticket.entity";
import { StepService } from "./step.service";
import { Model } from "mongoose";
import { Inject } from "../common/dependency-injection/inject";
import { Step } from "./step.entity";
import { PaymentService } from "../payment/payment.service";

@Injectable()
export class PaymentStep extends StepService {
	constructor(
		@Inject("StepModel") stepModel: Model<Step>,
		@Inject("TicketModel") ticketModel: Model<Ticket>,
		@Inject(PaymentService.name) private readonly paymentService: PaymentService
	) {
		super(stepModel, ticketModel);
	}

	override async run(
		ticket: Ticket,
		_text: string
	): Promise<OutputTaskInterpretation> {
		const step = await this.model.findOne({
			stepNumber: ticket.currentStep,
		});

		const client = new SecretsManagerClient({
			region: process.env.AWS_REGION_SSM,
			credentials: {
				accessKeyId: process.env.AWS_ACCESS_KEY_ID_SSM,
				secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_SSM,
			},
		});

		const command = new GetSecretValueCommand({ SecretId: "BEARER_EFI" });
		const response = await client.send(command);

		const token = response.SecretString;

		const totalValue = ticket.cart.reduce((prev, curr) => {
			return prev + curr.price;
		}, 0);

		const payment = await this.paymentService.createPayment(
			{
				calendario: {
					expiracao: 3600,
				},
				devedor: {
					cnpj: ticket.user.nationalId,
					nome: ticket.user.name,
				},
				valor: {
					original: totalValue.toFixed(2),
				},
				chave: process.env.EFI_PIX_KEY as string,
				solicitacaoPagador: "Pagamento solicitado através do app Conversales.",
			},
			token
		);

		return {
			rule: step.rule,
			params: {
				pixCopyAndPaste: payment.pixCopiaECola,
			},
		};
	}
}
