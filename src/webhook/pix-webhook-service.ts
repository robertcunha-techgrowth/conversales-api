import { Model } from "mongoose";
import { Inject } from "../common/dependency-injection/inject";
import { Injectable } from "../common/dependency-injection/injectable";
import { Payment, PaymentStatus } from "../payment/domain/payment.entity";
import { EndToEndPix } from "../payment/infrastructure/types";
import { Channel } from "../channel/channel";
import { ChatBot } from "../chatbot/chatbot";
import { Ticket } from "../ticket/ticket.entity";
import { Step } from "../step/step.entity";
import { Notify, NotifyWhatsapp } from "../notify/notify";
import { PixPayment } from "../payment/domain/pix-payment.entity";

@Injectable()
export class PixWebhookService {
	constructor(
		@Inject("PaymentPixModel")
		private readonly paymentModel: Model<PixPayment>,
		@Inject("Chatbot") private readonly chatbot: ChatBot,
		@Inject("Channel") private readonly channel: Channel,
		@Inject("ChannelWhatsapp") private readonly channelWhatsapp: Channel,
		@Inject("StepModel") private readonly stepModel: Model<Step>,
		@Inject("TicketModel") private readonly ticketModel: Model<Ticket>,
		@Inject(NotifyWhatsapp.name) private readonly notifyWhatsapp: Notify
	) {}

	async run(pix: EndToEndPix[]) {
		const paymentsUpdatePromise = pix.map((value: EndToEndPix) => {
			return this.executePayment(value);
		});
		return Promise.all(paymentsUpdatePromise);
	}

	private async executePayment(value: EndToEndPix) {
		const payment = await this.paymentModel.findOneAndUpdate(
			{ externalTransactionId: value.txid },
			{
				status: PaymentStatus.PAID,
			},
			{
				new: true,
			}
		);

		if (!payment) {
			throw {
				statusCode: 404,
				status: 404,
				message: `Can't find payment with txid ${value.txid}`,
			};
		}

		const ticketId = payment.ticket;

		const ticket = await this.ticketModel.findOne({
			_id: ticketId,
		});

		const step = await this.stepModel.findOne({
			kind: "WEBHOOK_PIX_PAYMENT",
			company: ticket.company,
		});

		const botTemplate = await this.chatbot.getAIResponseText(
			step.rule,
			{},
			ticket
		);

		if (ticket.channel === "WHATSAPP") {
			await this.channelWhatsapp.sendMessage(ticket.from, botTemplate);
		} else {
			await this.channel.sendMessage(ticket.from, botTemplate);
		}

		await this.ticketModel.findOneAndUpdate(
			{
				_id: ticket._id,
			},
			{
				currentStep: step.chainedStep,
			}
		);

		const message = this.formatMessage(ticket);

		await this.notifyWhatsapp.notify(ticket.user.cellphone, message);

		return ticket;
	}

	private formatMessage(ticket: Ticket) {
		return `${ticket.cart
			.map((item) => `${item.name}`)
			.join("\n")} foi vendido. Dados da venda:\nNome:${
			ticket.user.name
		}\n$CNPJ:${ticket.user.nationalId}\n$Email:${
			ticket.user.email
		}\n$Telefone:${ticket.user.cellphone}`;
	}
}
