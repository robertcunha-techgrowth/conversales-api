import { Ticket } from "../ticket/ticket.entity";
import { OutputTaskInterpretation } from "../chatbot/chatbot";
import { Model, QueryOptions, UpdateQuery } from "mongoose";
import { Step } from "./step.entity";

export abstract class StepService {
	constructor(
		protected readonly stepModel: Model<Step>,
		protected readonly ticketModel: Model<Ticket>
	) {}

	abstract run(ticket: Ticket, text: string): Promise<OutputTaskInterpretation>;

	protected updateTicket(
		ticketId: string,
		update: UpdateQuery<Ticket>,
		options?: QueryOptions<Ticket>
	) {
		return this.ticketModel.findOneAndUpdate(
			{
				_id: ticketId,
			},
			{
				...update,
				lastResponse: new Date(),
			},
			options
		);
	}
}
