import {
	SecretsManagerClient,
	GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";
import { OutputTaskInterpretation } from "../../../chatbot/chatbot";
import { Injectable } from "../../../common/dependency-injection/injectable";
import { Ticket } from "../../../ticket/ticket.entity";
import { StepService } from "../../step.service";
import { Model } from "mongoose";
import { Inject } from "../../../common/dependency-injection/inject";
import { Step } from "../../step.entity";
import { PixPaymentDomainService } from "../../../payment/domain/pix-payment.service";
import { PixPayment } from "../../../payment/domain/pix-payment.entity";

@Injectable()
export class PaymentStep extends StepService {
	constructor(
		@Inject("StepModel") stepModel: Model<Step>,
		@Inject("TicketModel") ticketModel: Model<Ticket>,
		@Inject(PixPaymentDomainService.name)
		protected readonly paymentService: PixPaymentDomainService
	) {
		super(stepModel, ticketModel);
	}

	override async run(
		ticket: Ticket,
		_text: string
	): Promise<OutputTaskInterpretation> {
		const step = await this.stepModel.findOne({
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

		const payment = await this.paymentService.create(
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
			token,
			ticket._id.toString()
		);

		const params = {
			pixCopyAndPaste: (payment as PixPayment).pixCopyAndPaste,
		};

		await this.updateTicket(ticket._id.toString(), {
			currentStep: step.chainedStep,
			previousInput: {
				rule: step.rule,
				params,
			},
		});

		return {
			rule: step.rule,
			params,
		};
	}
}
