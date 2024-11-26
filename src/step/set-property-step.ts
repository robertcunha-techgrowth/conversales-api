import { Model } from "mongoose";
import { Inject } from "../common/dependency-injection/inject";
import { Injectable } from "../common/dependency-injection/injectable";
import { Ticket } from "../ticket/ticket.entity";
import { StepService } from "./step.service";
import { OutputTaskInterpretation, InputStepParams } from "../chatbot/chatbot";
import { StepKind } from "./step.entity";

export interface SetPropertyUserMessageParams extends InputStepParams {
	property: string;
	value: string;
}

@Injectable()
export class SetPropertyStep extends StepService {
	override async run(
		ticket: Ticket,
		params?: SetPropertyUserMessageParams
	): Promise<OutputTaskInterpretation> {
		const { property, value } = params;
		ticket.user[property] = value;
		await this.ticketModel.findOneAndUpdate(
			{
				_id: ticket._id,
			},
			{
				user: ticket.user,
			}
		);
		return {
			step: StepKind.SET_PROPERTY,
			params: {
				property,
				filledProperties: {
					name: ticket.user.name,
					nationalId: ticket.user.nationalId,
					email: ticket.user.email,
				},
			},
		};
	}

	constructor(@Inject("TicketModel") ticketModel: Model<Ticket>) {
		super(ticketModel);
	}
}
