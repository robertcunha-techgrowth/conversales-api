import { Model } from "mongoose";
import { OutputTaskInterpretation } from "../chatbot/chatbot";
import { Inject } from "../common/dependency-injection/inject";
import { Injectable } from "../common/dependency-injection/injectable";
import { Ticket } from "../ticket/ticket.entity";
import { Step } from "./step.entity";
import { StepService } from "./step.service";

@Injectable()
export class IntroStep extends StepService {
	constructor(
		@Inject("StepModel") stepModel: Model<Step>,
		@Inject("TicketModel") ticketModel: Model<Ticket>
	) {
		super(stepModel, ticketModel);
	}

	async run(ticket: Ticket, _text: string): Promise<OutputTaskInterpretation> {
		const step = await this.model
			.findOne({
				stepNumber: ticket.currentStep,
			})
			.lean();
		await this.ticketModel.findOneAndUpdate(
			{
				_id: ticket._id,
			},
			{
				currentStep: step.detectStepToRedirect,
			}
		);
		const newStep = await this.model
			.findOne({
				stepNumber: step.detectStepToRedirect,
			})
			.lean();
		newStep.menu.items.map((item) => {
			return `${item.key}. ${item}`;
		});
		return {
			rule: step.rule,
			params: {
				menu: {
					1: "Listar Produtos",
					2: "Informações de contato",
					3: "Encerrar contato",
				},
			},
		};
	}
}
