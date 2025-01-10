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
		@Inject(SetPropertyStep.name) setProperty: StepService,
		@Inject(CheckoutStep.name) checkoutStep: StepService,
		@Inject(DetectStep.name) detectStep: StepService,
		@Inject(FinishContactStep.name) finishContactStep: StepService,
		@Inject(PaymentStep.name) paymentStep: StepService,
		@Inject("Chatbot") chatbot: ChatBot,
		@Inject("Channel") channel: Channel,
		@Inject("StepModel") stepModel: Model<Step>,
		@Inject(ContactInfoStep.name) private readonly contactInfoStep: StepService,
		@Inject(WaitPaymentStep.name) private readonly waitPaymentStep: StepService,
		@Inject(RateServiceStep.name) private readonly rateServiceStep: StepService
	) {
		super(
			ticketModel,
			{
				GREETING: normalStep,
				LIST_PRODUCTS: listProductsStep,
				ADD_PRODUCT: addProduct,
				SET_PROPERTY: setProperty,
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
			"TELEGRAM"
		);
	}

	override async webhook(data: WebhookTelegramData, companyId: string) {
		const { text } = data.message;

		const id = this.findId(data);

		const ticket = await this.getTicket(id.toString(), companyId);

		const { company } = ticket;

		const step = await this.stepModel.findOne({
			stepNumber: ticket.currentStep,
			company,
		});

		const { kind } = step;

		try {
			const { rule, params } = await this.steps[kind].run(ticket, text);
			await this.sendMessage(rule, params, id, ticket);
			return ticket;
		} catch (err) {
			console.log(err);
			await this.sendMessage(
				`Atenção: a regra a seguir deve vir acompanhada de uma mensagem informando ao usuário que o bot não entendeu a opção digitada. \n${ticket.previousInput.rule}`,
				ticket.previousInput?.params,
				id,
				ticket
			);
			return ticket;
		}
	}

	private async sendMessage(
		rule: string,
		params: InputStepParams,
		from: string,
		ticket: Ticket
	) {
		const message = await this.chatbot.getMessageTemplate(rule, params, ticket);
		await this.channel.sendMessage(from, message);
	}
}
