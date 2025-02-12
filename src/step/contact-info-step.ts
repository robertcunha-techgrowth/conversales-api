import { Model } from "mongoose";
import { OutputTaskInterpretation } from "../chatbot/chatbot";
import { Inject } from "../common/dependency-injection/inject";
import { Injectable } from "../common/dependency-injection/injectable";
import { Ticket } from "../ticket/ticket.entity";
import { Step } from "./step.entity";
import { StepService } from "./step.service";
import { MenuItem } from "../menu/menu.entity";

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

		const nextStep = await this.stepModel
			.findOne({
				stepNumber: step.chainedStep,
			})
			.lean();

		await this.updateTicket(ticket._id.toString(), {
			currentStep: step.chainedStep,
			previousInput: {
				rule: nextStep.rule,
				params: {
					company: company,
					channelFormat: ticket.channel,
				},
			},
		});

		const menu = nextStep.menu.items.reduce<Record<number, MenuItem>>(
			(prev, item, index) => {
				prev[index + 1] = item;
				return prev;
			},
			{}
		);

		return {
			rule: `${step.rule}\n${nextStep.rule}`,
			params: {
				company: company,
				channelFormat: ticket.channel,
				menu,
			},
		};
	}
}
