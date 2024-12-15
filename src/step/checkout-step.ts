import { Model } from "mongoose";
import {
	UserMessageParams,
	OutputTaskInterpretation,
} from "../chatbot/chatbot";
import { Inject } from "../common/dependency-injection/inject";
import { Injectable } from "../common/dependency-injection/injectable";
import { Ticket } from "../ticket/ticket.entity";
import { Step } from "./step.entity";
import { StepService } from "./step.service";

@Injectable()
export class CheckoutStep extends StepService {
	constructor(
		@Inject("StepModel") stepModel: Model<Step>,
		@Inject("TicketModel") ticketModel: Model<Ticket>
	) {
		super(stepModel, ticketModel);
	}

	override async run(
		ticket: Ticket,
		_params?: UserMessageParams
	): Promise<OutputTaskInterpretation> {
		const step = await this.stepModel.findOne({
			stepNumber: ticket.currentStep,
		});
		const { user, cart } = ticket;
		if (!cart.length) {
			throw {
				statusCode: 400,
				body: {
					message: "Cart is empty.",
				},
			};
		}

		if (!user.name || !user.nationalId || !user) {
			throw {
				statusCode: 400,
				body: {
					message: "User information is missing.",
				},
			};
		}

		await this.ticketModel.findOneAndUpdate(
			{
				_id: ticket._id,
			},
			{
				currentStep: step.chainedStep,
				previousInput: {
					rule: step.rule,
					params: {
						user: user,
						products: cart.map((product) => {
							return {
								name: product.name,
								price: product.price,
								description: product.description,
							};
						}),
						total: cart.reduce((acc, product) => acc + product.price, 0),
					},
				},
			}
		);

		return {
			rule: step.rule,
			params: {
				user: user,
				products: cart.map((product) => {
					return {
						name: product.name,
						price: product.price,
						description: product.description,
					};
				}),
				total: cart.reduce((acc, product) => acc + product.price, 0),
			},
		};
	}
}
