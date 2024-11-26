import { Model } from "mongoose";
import { Inject } from "../common/dependency-injection/inject";
import { Injectable } from "../common/dependency-injection/injectable";
import { Ticket } from "../ticket/ticket.entity";
import { WebhookData, WebhookService } from "./webhook.service";
import { Step } from "../step/step.entity";
import { ChatBot, OutputTaskInterpretation } from "../chatbot/chatbot";
import { Channel } from "../channel/channel";
import { IntroStep } from "../step/introduction-step";
import { ListProductsStep } from "../step/list-product-step";
import { StepService } from "../step/step.service";
import { AddProductStep } from "../step/add-product-step";
import { SetPropertyStep } from "../step/set-property-step";
import { CheckoutStep } from "../step/checkout-step";

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
		@Inject(AddProductStep.name) addProduct: StepService,
		@Inject(SetPropertyStep.name) setProperty: StepService,
		@Inject(CheckoutStep.name) checkoutStep: StepService,
		// @Inject("StepModel") private readonly stepModel: Model<Step>,
		@Inject("Chatbot") private readonly chatbot: ChatBot,
		@Inject("Channel") private readonly channel: Channel
	) {
		super(
			ticketModel,
			{
				GREETING: normalStep,
				LIST_PRODUCTS: listProductsStep,
				ADD_PRODUCT: addProduct,
				SET_PROPERTY: setProperty,
				CHECKOUT: checkoutStep,
			},
			"TELEGRAM"
		);
	}

	override async webhook(data: WebhookTelegramData) {
		const { text } = data.message;

		const { id } = data.message.chat;

		const ticket = await this.getTicket(id.toString());
		try {
			const itemToInterpreate = {
				message: text,
				task: "INTERPRETATE",
				previousStep: ticket.previousStep,
			};
			const { step, params } = await this.chatbot.interpretateMessage(
				JSON.stringify(itemToInterpreate)
			);

			await this.ticketModel.findOneAndUpdate(
				{
					_id: ticket._id,
				},
				{
					previousStep: step,
				}
			);

			console.log(`Step: ${step}\nParams: ${params}`);

			const inputParams: OutputTaskInterpretation = await this.steps[step].run(
				ticket,
				params
			);

			const { message } = await this.chatbot.getMessage(inputParams, step);

			await this.channel.sendMessage(ticket.from, message);

			return ticket;
		} catch (err) {
			console.log(err);

			await this.channel.sendMessage(
				ticket.from,
				"Desculpe, não entendi o que você quis dizer"
			);
		}
	}
}
