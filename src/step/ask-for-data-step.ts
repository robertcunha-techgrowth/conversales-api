import { Model } from "mongoose";
import { OutputTaskInterpretation } from "../chatbot/chatbot";
import { Inject } from "../common/dependency-injection/inject";
import { Injectable } from "../common/dependency-injection/injectable";
import { MenuItem } from "../menu/menu.entity";
import { Ticket } from "../ticket/ticket.entity";
import { Step } from "./step.entity";
import { StepService } from "./step.service";

@Injectable()
export class AskForDataStep extends StepService {
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

		const { rule } = step;

		const params = {
			channelFormat: ticket.channel,
		};

		await this.updateTicket(ticket._id.toString(), {
			currentStep: step.chainedStep,
			previousInput: {
				rule,
				params,
			},
		});

		return {
			rule,
			params,
		};
	}
}
