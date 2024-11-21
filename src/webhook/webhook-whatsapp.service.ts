import { Model } from "mongoose";
import { Inject } from "../common/dependency-injection/inject";
import { Injectable } from "../common/dependency-injection/injectable";
import {
	IntroStep,
	ListProductsStep,
	SelectedProductStep,
	StepService,
} from "../step/step.service";
import { Ticket } from "../ticket/ticket.entity";
import { WebhookData, WebhookService } from "./webhook.service";

export interface WebhookWhatsappData extends WebhookData {
	object: "whatsapp_business_account";
	entry: [
		{
			id: "WHATSAPP_BUSINESS_ACCOUNT_ID";
			changes: [
				{
					value: {
						messaging_product: "whatsapp";
						metadata: {
							display_phone_number: "PHONE_NUMBER";
							phone_number_id: "PHONE_NUMBER_ID";
						};
						contacts: [
							{
								profile: {
									name: "User Name";
								};
								wa_id: "USER_PHONE_NUMBER";
							}
						];
						messages: [
							{
								from: "USER_PHONE_NUMBER";
								id: "MESSAGE_ID";
								timestamp: "TIMESTAMP";
								text: {
									body: "Message text here";
								};
								type: "text";
							}
						];
					};
					field: "messages";
				}
			];
		}
	];
}

export interface TicketMessage {
	ticket: Ticket;
	message: string;
}

@Injectable()
export class WebhookWhatsappService extends WebhookService {
	constructor(
		@Inject("TicketModel") ticketModel: Model<Ticket>,
		@Inject(IntroStep.name) normalStep: StepService,
		@Inject(ListProductsStep.name) listProductsStep: StepService,
		@Inject(SelectedProductStep.name) selectedProductStep: StepService
	) {
		super(
			ticketModel,
			{
				"1": normalStep,
				"2": listProductsStep,
				"3": selectedProductStep,
			},
			"WHATSAPP"
		);
	}

	async webhook(data: WebhookWhatsappData) {
		const messages = data.entry
			.map((entry) => entry.changes.map((change) => change.value.messages))
			.flat()
			.flat();
		const promisesTicketWithMessage = messages.map((message) =>
			this.setTicketForMessage(message.from, message.text.body)
		);

		const ticketAndMessage = await Promise.all(promisesTicketWithMessage);
		const runPromises = ticketAndMessage.map(({ ticket, message }) => {
			return this.steps[ticket.currentStep].run(ticket, message);
		});
		await Promise.all(runPromises);
	}

	private async setTicketForMessage(
		from: string,
		message: string
	): Promise<TicketMessage> {
		const ticket = await this.getTicket(from);
		return {
			ticket,
			message,
		};
	}
}
