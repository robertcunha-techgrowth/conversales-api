import { Model } from "mongoose";
import { StatusTicket, Ticket } from "../ticket/ticket.entity";
import { StepService } from "../step/step.service";
import { Step, StepKind } from "../step/step.entity";
import { ChatBot } from "../chatbot/chatbot";
import { Channel } from "../channel/channel";

export interface WebhookData {}

export interface FindIdParams {}

export abstract class WebhookService {
	protected channelId: string;

	constructor(
		protected readonly ticketModel: Model<Ticket>,
		protected readonly steps: Record<StepKind, StepService>,
		protected readonly chatbot: ChatBot,
		protected readonly stepModel: Model<Step>,
		protected readonly channel: Channel,
		channelId: string
	) {
		this.channelId = channelId;
	}

	abstract webhook(data: WebhookData, companyId: string): Promise<Ticket>;

	protected async getTicket(from: string, companyId: string): Promise<Ticket> {
		const documentId = `${this.channelId}:${from}`;
		console.log(`Getting ticket for ${documentId}`);
		const ticket = await this.ticketModel
			.findOne(
				{
					documentId,
					status: StatusTicket.Active,
					company: companyId,
				},
				null,
				{
					populate: [
						{
							path: "company",
						},
					],
				}
			)
			.lean();
		if (!ticket) {
			const newTicket = await this.ticketModel.create({
				documentId,
				status: StatusTicket.Active,
				from,
				channel: this.channelId,
				currentStep: 1,
				company: companyId,
			});
			return newTicket.toObject();
		}
		return ticket;
	}

	protected abstract findId(data: FindIdParams): string;

	async retryContact(ticket: Ticket) {
		if (ticket.retryCount > 0) {
			const message = await this.chatbot.getMessageTemplate(
				`O cliente está ausente. Crie uma mensagem chamando ele de volta para a conversa e respeite a regra a seguir. ${ticket.previousInput.rule}`,
				ticket.previousInput.params,
				ticket
			);

			await this.channel.sendMessage(ticket.from, message);
			await this.ticketModel.findOneAndUpdate(
				{
					_id: ticket._id,
				},
				{
					$inc: { retryCount: -1 },
				}
			);
			return ticket;
		}

		const message = await this.chatbot.getMessageTemplate(
			`Encerre o contato por ausência do cliente.`,
			{},
			ticket
		);
		await this.channel.sendMessage(message, ticket.from);
		await this.ticketModel.findOneAndUpdate(
			{
				_id: ticket._id,
			},
			{
				status: StatusTicket.Abandoned,
			}
		);
		return ticket;
	}
}
