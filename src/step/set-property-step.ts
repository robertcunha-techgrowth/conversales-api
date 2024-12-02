import { Model } from "mongoose";
import { Inject } from "../common/dependency-injection/inject";
import { Injectable } from "../common/dependency-injection/injectable";
import { Ticket } from "../ticket/ticket.entity";
import { StepService } from "./step.service";
import { OutputTaskInterpretation, InputStepParams } from "../chatbot/chatbot";
import { Step, StepKind } from "./step.entity";

export interface SetPropertyUserMessageParams extends InputStepParams {
	property: string;
	value: string;
}

@Injectable()
export class SetPropertyStep extends StepService {
	[key: string]: any;

	override async run(
		ticket: Ticket,
		text: string
	): Promise<OutputTaskInterpretation> {
		const step = await this.model.findOne({
			stepNumber: ticket.currentStep,
		});
		const { property } = step;
		const value = await this[property](text);
		ticket.user[property] = value;
		await this.ticketModel.findOneAndUpdate(
			{
				_id: ticket._id,
			},
			{
				user: ticket.user,
				currentStep: step.chainedStep,
			}
		);
		return {
			rule: step.rule,
		};
	}

	private async name(value: string) {
		if (!value) {
			throw {
				statusCode: 400,
				body: {
					message: "Name is required.",
				},
			};
		}
		return value;
	}

	private async nationalId(value: string) {
		if (!value) {
			throw {
				statusCode: 400,
				body: {
					message: "National ID is required.",
				},
			};
		}
		return value;
	}

	private async email(value: string) {
		if (!value) {
			throw {
				statusCode: 400,
				body: {
					message: "Email is required.",
				},
			};
		}
		return value;
	}

	constructor(
		@Inject("StepModel") stepModel: Model<Step>,
		@Inject("TicketModel") ticketModel: Model<Ticket>
	) {
		super(stepModel, ticketModel);
	}
}
