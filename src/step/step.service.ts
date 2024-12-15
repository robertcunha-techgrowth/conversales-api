import { Ticket } from "../ticket/ticket.entity";
import { OutputTaskInterpretation } from "../chatbot/chatbot";
import { Model } from "mongoose";
import { Step } from "./step.entity";

export abstract class StepService {
	constructor(
		protected readonly stepModel: Model<Step>,
		protected readonly ticketModel: Model<Ticket>
	) {}

	abstract run(ticket: Ticket, text: string): Promise<OutputTaskInterpretation>;
}
