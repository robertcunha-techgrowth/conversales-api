import { Model } from "mongoose";
import { OutputTaskInterpretation } from "../../chatbot/chatbot";
import { Inject } from "../../common/dependency-injection/inject";
import { StatusTicket, Ticket } from "../../ticket/ticket.entity";
import { Step } from "../step.entity";
import { Injectable } from "../../common/dependency-injection/injectable";
import { InputUserStep } from "./input-user-step";

@Injectable()
export class RateServiceStep extends InputUserStep {
	constructor(
		@Inject("StepModel") stepModel: Model<Step>,
		@Inject("TicketModel") ticketModel: Model<Ticket>
	) {
		super(stepModel, ticketModel);
	}

	override async run(
		ticket: Ticket,
		text: string
	): Promise<OutputTaskInterpretation> {
		const step = await this.stepModel
			.findOne({
				stepNumber: ticket.currentStep,
			})
			.lean();

		const rateValue = this.validateInput(text);
		await this.ticketModel.findOneAndUpdate(
			{
				_id: ticket._id,
			},
			{
				currentStep: step.chainedStep,
				rateService: +rateValue,
			}
		);
		return {
			rule: step.rule,
			params: {},
		};
	}

	protected override validateInput(text: string): string {
		const number = +text.replace(/\D/g, "");
		if (number < 1 || number > 5) {
			throw new Error("Invalid input");
		}
		return number.toString();
	}
}
