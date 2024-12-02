import { Model } from "mongoose";
import { StatusTicket, Ticket } from "../ticket/ticket.entity";
import { StepService } from "../step/step.service";
import { StepKind } from "../step/step.entity";

export interface WebhookData {}

export abstract class WebhookService {
	protected channelId: string;

	constructor(
		protected readonly ticketModel: Model<Ticket>,
		protected readonly steps: Record<StepKind, StepService>,
		channelId: string
	) {
		this.channelId = channelId;
	}

	abstract webhook(data: WebhookData): Promise<Ticket>;

	protected async getTicket(from: string): Promise<Ticket> {
		const documentId = `${this.channelId}:${from}`;
		console.log(`Getting ticket for ${documentId}`);
		const ticket = await this.ticketModel
			.findOne({
				documentId,
				status: StatusTicket.Active,
			})
			.lean();
		if (!ticket) {
			const newTicket = await this.ticketModel.create({
				documentId,
				status: StatusTicket.Active,
				from,
				channel: this.channelId,
				currentStep: 1,
			});
			return newTicket.toObject();
		}
		return ticket;
	}
}
