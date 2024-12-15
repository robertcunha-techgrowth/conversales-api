import { Model } from "mongoose";
import { OutputTaskInterpretation } from "../chatbot/chatbot";
import { Inject } from "../common/dependency-injection/inject";
import { Injectable } from "../common/dependency-injection/injectable";
import { Ticket } from "../ticket/ticket.entity";
import { Step } from "./step.entity";
import { StepService } from "./step.service";

@Injectable()
export class ContactInfoStep extends StepService {
	constructor(
		@Inject("StepModel") stepModel: Model<Step>,
		@Inject("TicketModel") ticketModel: Model<Ticket>
	) {
		super(stepModel, ticketModel);
	}

	override async run(
		ticket: Ticket,
		text: string
	): Promise<OutputTaskInterpretation> {
		const step = await this.stepModel
			.findOne({
				stepNumber: ticket.currentStep,
			})
			.lean();

		const { company } = ticket;

		if (!company) {
			throw {
				statusCode: 400,
				body: {
					message: "Company information is missing.",
				},
			};
		}

		return {
			rule: step.rule,
			params: {
				company: company,
			},
		};
	}
}
