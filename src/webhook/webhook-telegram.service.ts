import { Model } from "mongoose";
import { Inject } from "../common/dependency-injection/inject";
import { Injectable } from "../common/dependency-injection/injectable";
import {
	IntroStep,
	StepService,
	CollectData,
	CheckoutStep,
	ConfirmStep,
	ListProductsStep,
	SelectedProductStep,
} from "../step/step.service";
import { Ticket } from "../ticket/ticket.entity";
import { WebhookData, WebhookService } from "./webhook.service";
import { Step } from "../step/step.entity";

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
		@Inject(IntroStep.name) normalStep: StepService,
		@Inject(ListProductsStep.name) listProductsStep: StepService,
		@Inject(SelectedProductStep.name) selectedProductStep: StepService,
		@Inject(CollectData.name) collectDataStep: StepService,
		@Inject(CheckoutStep.name) checkoutStep: StepService,
		@Inject(ConfirmStep.name) confirmStep: StepService,
		@Inject("StepModel") private readonly stepModel: Model<Step>
	) {
		super(
			ticketModel,
			{
				INTRO_STEP: normalStep,
				LIST_PRODUCTS_STEP: listProductsStep,
				SELECT_PRODUCT_STEP: selectedProductStep,
				COLLECT_DATA_STEP: collectDataStep,
				CHECKOUT_STEP: checkoutStep,
				CONFIRM_STEP: confirmStep,
			},
			"TELEGRAM"
		);
	}

	async webhook(data: WebhookTelegramData) {
		const { text } = data.message;

		// const { id } = data.message.from;

		// console.log(`Received message from ${id}`);

		const { id } = data.message.chat;

		const ticket = await this.getTicket(id.toString());

		const step = await this.stepModel
			.findOne({
				stepNumber: ticket.currentStep,
			})
			.lean();

		return this.steps[step.kind].run(ticket, text);
	}
}
