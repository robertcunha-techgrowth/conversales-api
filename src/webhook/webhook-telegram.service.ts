import { Model } from "mongoose";
import { Inject } from "../common/dependency-injection/inject";
import { Injectable } from "../common/dependency-injection/injectable";
import { Ticket } from "../ticket/ticket.entity";
import { FindIdParams, WebhookData, WebhookService } from "./webhook.service";
import { ChatBot, InputStepParams } from "../chatbot/chatbot";
import { Channel } from "../channel/channel";
import { IntroStep } from "../step/introduction-step";
import { ListProductsStep } from "../step/list-product-step";
import { StepService } from "../step/step.service";
import { AddProductStep } from "../step/add-product-step";
import { SetPropertyStep } from "../step/set-property-step";
import { CheckoutStep } from "../step/checkout-step";
import { Step } from "../step/step.entity";
import { DetectStep } from "../step/input-user/detect-step";
import { FinishContactStep } from "../step/finish-contact.step";
import { PaymentStep } from "../step/payment/domain/payment-step";
import { ContactInfoStep } from "../step/contact-info-step";
import { WaitPaymentStep } from "../step/payment/domain/wait-payment.step";
import { RateServiceStep } from "../step/input-user/rate-service-step";
import { SetNameStep } from "../step/set-name-step";
import { SetCnpjStep } from "../step/set-cnpj-step";
import { SetEmailStep } from "../step/set-email-step";
import { SetCellphoneStep } from "../step/set-cellphone-step";

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

export interface FindIdParamsTelegram extends FindIdParams {
	message: {
		chat: {
			id: string;
		};
	};
}

@Injectable()
export class WebhookTelegramService extends WebhookService {
	protected override findId(data: FindIdParamsTelegram): string {
		return data.message.chat.id.toString();
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
		@Inject("Channel") channel: Channel,
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
				CHECKOUT: checkoutStep,
				DETECT_STEP: detectStep,
				FINISH_CONTACT: finishContactStep,
				PAYMENT: paymentStep,
				CONTACT_INFO: contactInfoStep,
				WAIT_PAYMENT: waitPaymentStep,
				RATE_SERVICE: rateServiceStep,
				SET_NAME: setNameStep,
				SET_EMAIL: setEmailStep,
				SET_CELLPHONE: setCellphoneStep,
				SET_CNPJ: setCnpjStep,
			},
			chatbot,
			stepModel,
			channel,
			"TELEGRAM"
		);
	}

	override async webhook(data: WebhookTelegramData, companyId: string) {
		const { text } = data.message;

		const id = this.findId(data);

		const ticket = await this.getTicket(id.toString(), companyId);

		return this.runStepForTicket(ticket, text);
	}
}
