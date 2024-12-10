import { Model } from "mongoose";
import { StatusTicket, Ticket } from "../ticket/ticket.entity";
import { StepService } from "../step/step.service";
import { StepKind } from "../step/step.entity";

export interface WebhookData {}

export interface FindIdParams {}

export abstract class WebhookService {
	protected channelId: string;

	constructor(
		protected readonly ticketModel: Model<Ticket>,
		protected readonly steps: Record<StepKind, StepService>,
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
}
