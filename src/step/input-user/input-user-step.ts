import { OutputTaskInterpretation } from "../../chatbot/chatbot";
import { Ticket } from "../../ticket/ticket.entity";
import { StepService } from "../step.service";

export class InputUserStep extends StepService {
	override run(
		ticket: Ticket,
		text: string
	): Promise<OutputTaskInterpretation> {
		throw new Error("Method not implemented.");
	}
}
