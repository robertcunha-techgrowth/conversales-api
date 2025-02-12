import { Model } from "mongoose";
import { Inject } from "../common/dependency-injection/inject";
import { Injectable } from "../common/dependency-injection/injectable";
import { Ticket } from "../ticket/ticket.entity";
import { SetNationalIdStep } from "./set-national-id-step";
import { Step } from "./step.entity";

@Injectable()
export class SetCnpjStep extends SetNationalIdStep {
	constructor(
		@Inject("StepModel") stepModel: Model<Step>,
		@Inject("TicketModel") ticketModel: Model<Ticket>
	) {
		super(stepModel, ticketModel);
	}

	protected override async validateNationalId(data: string): Promise<string> {
		const nationalId = data.replace(/\D/g, "");
		if (!nationalId) {
			throw {
				statusCode: 400,
				body: {
					message: "National ID is required.",
				},
			};
		}
		return nationalId;
	}
}
