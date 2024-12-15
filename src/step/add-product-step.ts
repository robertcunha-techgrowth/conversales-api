import { Model } from "mongoose";
import { InputStepParams, UserMessageParams } from "../chatbot/chatbot";
import { Injectable } from "../common/dependency-injection/injectable";
import { Ticket } from "../ticket/ticket.entity";
import { Step } from "./step.entity";
import { StepService } from "./step.service";
import { Inject } from "../common/dependency-injection/inject";
import { Product } from "../product/product.entity";

export interface StepParamsAddProduct extends InputStepParams {
	num: number;
}

@Injectable()
export class AddProductStep extends StepService {
	constructor(
		@Inject("StepModel") stepModel: Model<Step>,
		@Inject("TicketModel") ticketModel: Model<Ticket>
	) {
		super(stepModel, ticketModel);
	}

	private extractNumber(text: string) {
		const num = parseInt(text);
		if (isNaN(num)) {
			throw {
				statusCode: 400,
				body: {
					message: "Invalid product number.",
				},
			};
		}
		return num;
	}

	async run(ticket: Ticket, text: string) {
		const step = await this.stepModel.findOne({
			stepNumber: ticket.currentStep,
		});
		const num = this.extractNumber(text);
		const product = (ticket.products as Product[]).find(
			(product) => product.num === num
		);
		if (!product) {
			throw {
				statusCode: 404,
				body: {
					message: "Product not found.",
				},
			};
		}

		await this.ticketModel.findOneAndUpdate(
			{
				_id: ticket._id,
			},
			{
				$push: {
					cart: product,
				},

				currentStep: step.chainedStep,
				previousInput: {
					rule: step.rule,
					params: {
						product: {
							num: product.num,
							name: product.name,
							price: product.price,
							description: product.description,
						},
					},
				},
			}
		);

		return {
			rule: step.rule,
			params: {
				product: {
					num: product.num,
					name: product.name,
					price: product.price,
					description: product.description,
				},
			},
		};
	}
}
