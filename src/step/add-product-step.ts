import { Model } from "mongoose";
import { UserMessageParams } from "../chatbot/chatbot";
import { Injectable } from "../common/dependency-injection/injectable";
import { Ticket } from "../ticket/ticket.entity";
import { StepKind } from "./step.entity";
import { StepService } from "./step.service";
import { Inject } from "../common/dependency-injection/inject";
import { Product } from "../product/product.entity";

export interface StepParamsAddProduct extends UserMessageParams {
	num: number;
}

@Injectable()
export class AddProductStep extends StepService {
	constructor(@Inject("TicketModel") ticketModel: Model<Ticket>) {
		super(ticketModel);
	}

	async run(ticket: Ticket, params: StepParamsAddProduct) {
		console.log("MOTHER FUCKER");
		const { num } = params;
		console.log("NÃO FUMA BEQUE, FUMA GANJA");
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
			}
		);

		return {
			step: StepKind.ADD_PRODUCT,
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
