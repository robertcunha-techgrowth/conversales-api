import { Model } from "mongoose";
import { Inject } from "../common/dependency-injection/inject";
import { Injectable } from "../common/dependency-injection/injectable";
import { StepService } from "../step/step.service";
import { Ticket } from "../ticket/ticket";
import { WebhookData, WebhookService } from "./webhook.service";

export interface WebhookTelegramData extends WebhookData {
	message: {
		message_id: number;
		from: {
			id: number;
			is_bot: boolean;
			first_name: string;
			username: string;
		};
		text: string;
		chat: {
			id: string;
		};
	};
}

@Injectable()
export class WebhookTelegramService extends WebhookService {
	constructor(
		@Inject("TicketModel") ticketModel: Model<Ticket>,
		@Inject("StepService") stepService: StepService
	) {
		super(ticketModel, stepService, "TELEGRAM");
	}

	async webhook(data: WebhookTelegramData) {
		const { text } = data.message;

		// const { id } = data.message.from;

		// console.log(`Received message from ${id}`);

		const { id } = data.message.chat;

		const ticket = await this.getTicket(id.toString());

		return this.stepService.run(ticket, text);
	}
}
