import { Model } from "mongoose";
import { Inject } from "../common/dependency-injection/inject";
import { Ticket } from "../ticket/ticket.entity";
import { StepService } from "./step.service";
import { OutputTaskInterpretation, InputStepParams } from "../chatbot/chatbot";
import { Step } from "./step.entity";
import { MenuItem } from "../menu/menu.entity";

export interface SetPropertyUserMessageParams extends InputStepParams {
	property: string;
	value: string;
}

export abstract class SetPropertyStep extends StepService {
	[key: string]: any;

	override async run(
		ticket: Ticket,
		text: string
	): Promise<OutputTaskInterpretation> {
		const step = await this.stepModel.findOne({
			stepNumber: ticket.currentStep,
		});
		const { property } = step;
		const value = await this.runValidation(text);
		ticket.user[property] = value;

		const nextStep = await this.stepModel
			.findOne({
				stepNumber: step.chainedStep,
			})
			.lean();

		await this.updateTicket(ticket._id.toString(), {
			user: ticket.user,
			currentStep: step.chainedStep,
			previousInput: {
				rule: nextStep.rule,
				params: {
					channelFormat: ticket.channel,
					menu: nextStep.menu?.items?.reduce<Record<number, MenuItem>>(
						(prev, item, index) => {
							prev[index + 1] = item;
							return prev;
						},
						{}
					),
				},
			},
		});

		return {
			rule: nextStep.rule,
			params: {
				menu: nextStep.menu?.items?.reduce<Record<number, MenuItem>>(
					(prev, item, index) => {
						prev[index + 1] = item;
						return prev;
					},
					{}
				),
			},
		};
	}

	protected abstract runValidation(data: string): Promise<string>;

	constructor(
		@Inject("StepModel") stepModel: Model<Step>,
		@Inject("TicketModel") ticketModel: Model<Ticket>
	) {
		super(stepModel, ticketModel);
	}
}
