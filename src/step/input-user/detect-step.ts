import { Model } from "mongoose";
import { Inject } from "../../common/dependency-injection/inject";
import { Injectable } from "../../common/dependency-injection/injectable";
import { Ticket } from "../../ticket/ticket.entity";
import { AddProductStep } from "../add-product-step";
import { CheckoutStep } from "../checkout-step";
import { ListProductsStep } from "../list-product-step";
import { SetPropertyStep } from "../set-property-step";
import { Step, StepKind } from "../step.entity";
import { StepService } from "../step.service";
import { FinishContactStep } from "../finish-contact.step";
import { PaymentStep } from "../payment/domain/payment-step";
import { ContactInfoStep } from "../contact-info-step";
import { InputUserStep } from "./input-user-step";
import { SetCellphoneStep } from "../set-cellphone-step";
import { SetCnpjStep } from "../set-cnpj-step";
import { SetEmailStep } from "../set-email-step";
import { SetNameStep } from "../set-name-step";
import { AskForDataStep } from "../ask-for-data-step";

@Injectable()
export class DetectStep extends InputUserStep {
	private options: Record<string, StepService> = {};

	constructor(
		@Inject("StepModel") model: Model<Step>,
		@Inject("TicketModel") ticketModel: Model<Ticket>,
		@Inject(ListProductsStep.name) listProductStep: StepService,
		@Inject(AddProductStep.name) addProduct: StepService,
		@Inject(CheckoutStep.name) checkout: StepService,
		@Inject(SetNameStep.name) setNameStep: StepService,
		@Inject(SetCnpjStep.name) setCnpjStep: StepService,
		@Inject(SetEmailStep.name) setEmailStep: StepService,
		@Inject(SetCellphoneStep.name) setCellphoneStep: StepService,
		@Inject(FinishContactStep.name) finishContactStep: StepService,
		@Inject(PaymentStep.name) paymentStep: StepService,
		@Inject(ContactInfoStep.name) contactInfoStep: StepService,
		@Inject(AskForDataStep.name) askForDataStep: StepService
	) {
		super(model, ticketModel);
		this.options = {
			[StepKind.LIST_PRODUCTS]: listProductStep,
			[StepKind.ADD_PRODUCT]: addProduct,
			[StepKind.CHECKOUT]: checkout,
			[StepKind.SET_NAME]: setNameStep,
			[StepKind.SET_CNPJ]: setCnpjStep,
			[StepKind.SET_EMAIL]: setEmailStep,
			[StepKind.SET_CELLPHONE]: setCellphoneStep,
			[StepKind.FINISH_CONTACT]: finishContactStep,
			[StepKind.PAYMENT]: paymentStep,
			[StepKind.CONTACT_INFO]: contactInfoStep,
			[StepKind.ASK_FOR_DATA]: askForDataStep,
		};
	}

	override async run(ticket: Ticket, text: string) {
		const option = this.validateInput(text);
		const step = await this.stepModel
			.findOne({
				stepNumber: ticket.currentStep,
			})
			.lean();
		const menuItem = step.menu.items.find(
			(item: { key: string }) => item.key === option
		);
		if (!menuItem) {
			throw {
				statusCode: 400,
				message: "Invalid option",
			};
		}
		const nextStepNumber = menuItem.stepNumber;
		const nextStep = await this.stepModel.findOne({
			stepNumber: nextStepNumber,
		});
		ticket.currentStep = nextStepNumber;
		const runner = this.options[nextStep.kind];
		if (!runner) {
			throw {
				statusCode: 400,
				message: "Invalid option, can't find runner.",
			};
		}
		return runner.run(ticket, text);
	}

	protected override validateInput(text: string): string {
		if (!text) {
			throw {
				statusCode: 400,
				message: "Invalid response",
			};
		}
		return text.split(" ").shift();
	}
}
