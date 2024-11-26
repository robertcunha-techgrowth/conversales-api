import { Model } from "mongoose";
import { InputStepParams, OutputTaskInterpretation } from "../chatbot/chatbot";
import { Inject } from "../common/dependency-injection/inject";
import { Injectable } from "../common/dependency-injection/injectable";
import { Ticket } from "../ticket/ticket.entity";
import { StepKind } from "./step.entity";
import { StepService } from "./step.service";

@Injectable()
export class IntroStep extends StepService {
	constructor(@Inject("TicketModel") ticketModel: Model<Ticket>) {
		super(ticketModel);
	}

	async run(
		_ticket: Ticket,
		_params?: InputStepParams
	): Promise<OutputTaskInterpretation> {
		return {
			step: StepKind.GREETING,
		};
	}
}
