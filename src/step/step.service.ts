import { StatusTicket, Ticket } from "../ticket/ticket.entity";
import {
	ChatBot,
	OutputTaskInterpretation,
	UserMessageParams,
} from "../chatbot/chatbot";
import { Model } from "mongoose";
import { Step } from "./step.entity";

export abstract class StepService {
	constructor(
		protected readonly model: Model<Step>,
		protected readonly ticketModel: Model<Ticket>
	) {}

	abstract run(ticket: Ticket, text: string): Promise<OutputTaskInterpretation>;
}
