import {
	UserMessageParams,
	OutputTaskInterpretation,
} from "../chatbot/chatbot";
import { Injectable } from "../common/dependency-injection/injectable";
import { Ticket } from "../ticket/ticket.entity";
import { StepKind } from "./step.entity";
import { StepService } from "./step.service";

@Injectable()
export class CheckoutStep extends StepService {
	override async run(
		ticket: Ticket,
		_params?: UserMessageParams
	): Promise<OutputTaskInterpretation> {
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
		return {
			step: StepKind.CHECKOUT,
			params: {
				user: user,
				products: cart.map((product) => {
					return {
						num: product.num,
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
