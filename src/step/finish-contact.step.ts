import { Model } from "mongoose";
import { OutputTaskInterpretation } from "../chatbot/chatbot";
import { Inject } from "../common/dependency-injection/inject";
import { Injectable } from "../common/dependency-injection/injectable";
import { StatusTicket, Ticket } from "../ticket/ticket.entity";
import { Step } from "./step.entity";
import { StepService } from "./step.service";

@Injectable()
export class FinishContactStep extends StepService {
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
		const step = await this.stepModel
			.findOne({
				stepNumber: ticket.currentStep,
				company: ticket.company,
			})
			.lean();

		await this.updateTicket(ticket._id.toString(), {
			status: StatusTicket.Closed,
		});
		return {
			params: {
				channelFormat: ticket.channel,
			},
			rule: step.rule,
		};
	}
}
