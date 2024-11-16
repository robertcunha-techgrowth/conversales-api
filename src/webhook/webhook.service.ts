import { Model } from "mongoose";
import { StatusTicket, Ticket } from "../ticket/ticket";
import { StepService } from "../step/step.service";

export interface WebhookData {}

export abstract class WebhookService {
	protected channelId: string;

	constructor(
		protected readonly ticketModel: Model<Ticket>,
		protected readonly stepService: StepService,
		channelId: string
	) {
		this.channelId = channelId;
	}

	abstract webhook(data: WebhookData): Promise<void>;

	protected async getTicket(from: string): Promise<Ticket> {
		const documentId = `${this.channelId}:${from}`;
		console.log(`Getting ticket for ${documentId}`);
		const ticket = await this.ticketModel.findOne({
			documentId,
			status: StatusTicket.Active,
		});
		if (!ticket) {
			const newTicket = await this.ticketModel.create({
				documentId,
				status: StatusTicket.Active,
				from,
				currentStep: 1,
				channel: this.channelId,
			});
			return newTicket.toObject();
		}
		return ticket;
	}
}
