import { Model } from "mongoose";
import { Inject } from "../common/dependency-injection/inject";
import { Injectable } from "../common/dependency-injection/injectable";
import { Company } from "../company/company.entity";
import { Payment, PaymentStatus } from "../payment/domain/payment.entity";
import { EndToEndPix } from "../payment/infrastructure/types";
import { Channel } from "../channel/channel";
import { ChatBot } from "../chatbot/chatbot";
import { Ticket } from "../ticket/ticket.entity";
import { Step, StepKind } from "../step/step.entity";

@Injectable()
export class PixWebhookService {
	constructor(
		@Inject("PaymentPixModel")
		private readonly paymentModel: Model<Payment>,
		@Inject("Chatbot") private readonly chatbot: ChatBot,
		@Inject("Channel") private readonly channel: Channel,
		@Inject("StepModel") private readonly stepModel: Model<Step>,
		@Inject("TicketModel") private readonly ticketModel: Model<Ticket>
	) {}

	async run(pix: EndToEndPix[]) {
		const paymentsUpdatePromise = pix.map((value: EndToEndPix) => {
			return this.executePayment(value);
		});
		return Promise.all(paymentsUpdatePromise);
	}

	private async executePayment(value: EndToEndPix) {
		const payment = await this.paymentModel.findOneAndUpdate(
			{ endToEndId: value.endToEndId },
			{
				status: PaymentStatus.PAID,
			},
			{
				new: true,
				populate: [
					{
						path: "ticket",
					},
				],
			}
		);

		const ticket = payment.ticket as Ticket;

		const step = await this.stepModel.findOne({
			kind: "WEBHOOK_PIX_PAYMENT",
			company: ticket.company,
		});

		const botTemplate = await this.chatbot.getMessageTemplate(
			step.rule,
			{},
			ticket
		);

		await this.channel.sendMessage(ticket.from, botTemplate);

		await this.ticketModel.findOneAndUpdate(
			{
				_id: ticket._id,
			},
			{
				currentStep: step.chainedStep,
			}
		);

		return ticket;
	}
}
