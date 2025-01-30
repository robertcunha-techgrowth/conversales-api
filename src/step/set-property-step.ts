import { Model } from "mongoose";
import { Inject } from "../common/dependency-injection/inject";
import { Injectable } from "../common/dependency-injection/injectable";
import { Ticket } from "../ticket/ticket.entity";
import { StepService } from "./step.service";
import { OutputTaskInterpretation, InputStepParams } from "../chatbot/chatbot";
import { Step } from "./step.entity";

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

		await this.updateTicket(ticket._id.toString(), {
			user: ticket.user,
			currentStep: step.chainedStep,
			previousInput: {
				rule: step.rule,
				params: {
					channelFormat: ticket.channel,
				},
			},
		});
		return {
			rule: step.rule,
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
