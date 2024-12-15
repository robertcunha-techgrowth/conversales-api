import { Model } from "mongoose";
import { OutputTaskInterpretation } from "../chatbot/chatbot";
import { Inject } from "../common/dependency-injection/inject";
import { Ticket } from "../ticket/ticket.entity";
import { Step } from "./step.entity";
import { StepService } from "./step.service";
import { Injectable } from "../common/dependency-injection/injectable";

@Injectable()
export class RateServiceStep extends StepService {
	constructor(
		@Inject("StepModel") stepModel: Model<Step>,
		@Inject("TicketModel") ticketModel: Model<Ticket>
	) {
		super(stepModel, ticketModel);
	}

	override async run(
		ticket: Ticket,
		_text: string
	): Promise<OutputTaskInterpretation> {
		const step = await this.stepModel.findOne({
			stepNumber: ticket.currentStep,
		});
		return {
			rule: step.rule,
			params: {},
		};
	}
}
