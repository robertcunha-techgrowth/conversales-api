import { Model } from "mongoose";
import { Inject } from "../common/dependency-injection/inject";
import { Injectable } from "../common/dependency-injection/injectable";
import { Ticket } from "../ticket/ticket.entity";
import { AddProductStep } from "./add-product-step";
import { CheckoutStep } from "./checkout-step";
import { ListProductsStep } from "./list-product-step";
import { SetPropertyStep } from "./set-property-step";
import { Step, StepKind } from "./step.entity";
import { StepService } from "./step.service";
import { FinishContactStep } from "./finish-contact.step";
import { PaymentStep } from "./payment-step";

@Injectable()
export class DetectStep extends StepService {
	private options: Record<string, StepService> = {};

	constructor(
		@Inject("StepModel") model: Model<Step>,
		@Inject("TicketModel") ticketModel: Model<Ticket>,
		@Inject(ListProductsStep.name) listProductStep: StepService,
		@Inject(AddProductStep.name) addProduct: StepService,
		@Inject(CheckoutStep.name) checkout: StepService,
		@Inject(SetPropertyStep.name) setProperty: StepService,
		@Inject(FinishContactStep.name) finishContactStep: StepService,
		@Inject(PaymentStep.name) paymentStep: StepService
	) {
		super(model, ticketModel);
		this.options = {
			[StepKind.LIST_PRODUCTS]: listProductStep,
			[StepKind.ADD_PRODUCT]: addProduct,
			[StepKind.CHECKOUT]: checkout,
			[StepKind.SET_PROPERTY]: setProperty,
			[StepKind.FINISH_CONTACT]: finishContactStep,
			[StepKind.PAYMENT]: paymentStep,
		};
	}

	override async run(ticket: Ticket, text: string) {
		const option = this.validateText(text);
		const step = await this.model
			.findOne({
				stepNumber: ticket.currentStep,
			})
			.lean();
		const menuItem = step.menu.items.find((item) => item.key === option);
		const nextStepNumber = menuItem.stepNumber;
		const nextStep = await this.model.findOne({
			stepNumber: nextStepNumber,
		});
		ticket.currentStep = nextStepNumber;
		const runner = this.options[nextStep.kind];
		if (!runner) {
			throw {
				statusCode: 400,
				message: "Invalid option, can't finde runner.",
			};
		}
		return runner.run(ticket, text);
	}

	private validateText(text: string): string {
		if (!text) {
			throw {
				statusCode: 400,
				message: "Invalid response",
			};
		}
		return text.split(" ").shift();
	}
}
