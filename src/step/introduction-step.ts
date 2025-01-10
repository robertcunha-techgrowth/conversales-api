import { Model } from "mongoose";
import { OutputTaskInterpretation } from "../chatbot/chatbot";
import { Inject } from "../common/dependency-injection/inject";
import { Injectable } from "../common/dependency-injection/injectable";
import { Ticket } from "../ticket/ticket.entity";
import { Step } from "./step.entity";
import { StepService } from "./step.service";
import { MenuItem } from "../menu/menu.entity";

@Injectable()
export class IntroStep extends StepService {
	constructor(
		@Inject("StepModel") stepModel: Model<Step>,
		@Inject("TicketModel") ticketModel: Model<Ticket>
	) {
		super(stepModel, ticketModel);
	}

	async run(ticket: Ticket, _text: string): Promise<OutputTaskInterpretation> {
		const step = await this.stepModel
			.findOne({
				stepNumber: ticket.currentStep,
				company: ticket.company,
			})
			.lean();

		const menu = step.menu.items.reduce<Record<number, MenuItem>>(
			(prev, item, index) => {
				prev[index + 1] = item;
				return prev;
			},
			{}
		);

		await this.updateTicket(ticket._id.toString(), {
			currentStep: step.chainedStep,
			previousInput: {
				rule: step.rule,
				params: {
					menu,
				},
			},
		});

		return {
			rule: step.rule,
			params: {
				menu,
			},
		};
	}
}
