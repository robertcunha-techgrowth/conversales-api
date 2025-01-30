import { Model } from "mongoose";
import { Inject } from "../common/dependency-injection/inject";
import { Injectable } from "../common/dependency-injection/injectable";
import { Ticket } from "../ticket/ticket.entity";
import { SetPropertyStep } from "./set-property-step";
import { Step } from "./step.entity";

@Injectable()
export class SetEmailStep extends SetPropertyStep {
	constructor(
		@Inject("StepModel") stepModel: Model<Step>,
		@Inject("TicketModel") ticketModel: Model<Ticket>
	) {
		super(stepModel, ticketModel);
	}

	protected override async runValidation(data: string): Promise<string> {
		if (!data) {
			throw {
				statusCode: 400,
				body: {
					message: "Email is required.",
				},
			};
		}
		return data;
	}
}
