import { Model } from "mongoose";
import { Inject } from "../common/dependency-injection/inject";
import { Injectable } from "../common/dependency-injection/injectable";
import { StepService } from "../step/step.service";
import { Ticket } from "../ticket/ticket.entity";
import { FindIdParams, WebhookData, WebhookService } from "./webhook.service";
import { Step } from "../step/step.entity";
import { Channel } from "../channel/channel";
import { ChatBot } from "../chatbot/chatbot";
import { AddProductStep } from "../step/add-product-step";
import { IntroStep } from "../step/introduction-step";
import { ListProductsStep } from "../step/list-product-step";
import { SetPropertyStep } from "../step/set-property-step";
import { CheckoutStep } from "../step/checkout-step";
import { DetectStep } from "../step/input-user/detect-step";
import { FinishContactStep } from "../step/finish-contact.step";
import { PaymentStep } from "../step/payment/domain/payment-step";
import { ContactInfoStep } from "../step/contact-info-step";
import { WaitPaymentStep } from "../step/payment/domain/wait-payment.step";
import { RateServiceStep } from "../step/input-user/rate-service-step";
import { SetCellphoneStep } from "../step/set-cellphone-step";
import { SetCnpjStep } from "../step/set-cnpj-step";
import { SetEmailStep } from "../step/set-email-step";
import { SetNameStep } from "../step/set-name-step";

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

export interface FindIdParamsWhatsapp extends FindIdParams {
	from: string;
	id: string;
	timestamp: string;
	text: {
		body: string;
	};
	type: string;
}

@Injectable()
export class WebhookWhatsappService extends WebhookService {
	protected override findId(data: FindIdParamsWhatsapp): string {
		console.log(data);
		return data.from;
	}

	constructor(
		@Inject("TicketModel") ticketModel: Model<Ticket>,
		@Inject(IntroStep.name) normalStep: StepService,
		@Inject(ListProductsStep.name) listProductsStep: StepService,
		@Inject(AddProductStep.name) addProduct: StepService,
		@Inject(SetNameStep.name) setNameStep: StepService,
		@Inject(SetCnpjStep.name) setCnpjStep: StepService,
		@Inject(SetEmailStep.name) setEmailStep: StepService,
		@Inject(SetCellphoneStep.name) setCellphoneStep: StepService,
		@Inject(CheckoutStep.name) checkoutStep: StepService,
		@Inject(DetectStep.name) detectStep: StepService,
		@Inject(FinishContactStep.name) finishContactStep: StepService,
		@Inject(PaymentStep.name) paymentStep: StepService,
		@Inject("Chatbot") chatbot: ChatBot,
		@Inject("ChannelWhatsapp") channel: Channel,
		@Inject("StepModel") stepModel: Model<Step>,
		@Inject(ContactInfoStep.name) contactInfoStep: StepService,
		@Inject(WaitPaymentStep.name) waitPaymentStep: StepService,
		@Inject(RateServiceStep.name) rateServiceStep: StepService
	) {
		super(
			ticketModel,
			{
				GREETING: normalStep,
				LIST_PRODUCTS: listProductsStep,
				ADD_PRODUCT: addProduct,
				SET_NAME: setNameStep,
				SET_EMAIL: setEmailStep,
				SET_CELLPHONE: setCellphoneStep,
				SET_CNPJ: setCnpjStep,
				CHECKOUT: checkoutStep,
				DETECT_STEP: detectStep,
				FINISH_CONTACT: finishContactStep,
				PAYMENT: paymentStep,
				CONTACT_INFO: contactInfoStep,
				WAIT_PAYMENT: waitPaymentStep,
				RATE_SERVICE: rateServiceStep,
			},
			chatbot,
			stepModel,
			channel,
			"WHATSAPP"
		);
	}

	override async webhook(data: WebhookWhatsappData, companyId: string) {
		const messages = data.entry
			.map((entry) => entry.changes.map((change) => change.value.messages))
			.flat()
			.flat()
			.filter((message) => message);

		if (messages.length === 0) {
			return null;
		}

		const promisesTicketWithMessage = messages.map((message) => {
			const from = this.findId(message);
			return this.setTicketForMessage(from, message.text.body, companyId);
		});

		const ticketAndMessage = await Promise.all(promisesTicketWithMessage);
		const runPromises = ticketAndMessage.map(({ ticket, message }) => {
			return this.runStepForTicket(ticket, message);
		});

		await Promise.all(runPromises);

		return ticketAndMessage[0].ticket;
	}

	private async setTicketForMessage(
		from: string,
		message: string,
		companyId: string
	): Promise<TicketMessage> {
		const ticket = await this.getTicket(from, companyId);
		return {
			ticket,
			message,
		};
	}
}
