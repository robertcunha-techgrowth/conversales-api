import { StatusTicket, Ticket } from "../ticket/ticket.entity";
import {
	ChatBot,
	OutputTaskInterpretation,
	UserMessageParams,
} from "../chatbot/chatbot";
import { Model } from "mongoose";

export abstract class StepService {
	constructor(protected readonly ticketModel: Model<Ticket>) {}

	abstract run(
		ticket: Ticket,
		params?: UserMessageParams
	): Promise<OutputTaskInterpretation>;
}

// @Injectable()
// export class CheckoutStep extends StepService {
// 	constructor(
// 		@Inject("StepModel") model: Model<Step>,
// 		@Inject("Chatbot") chatbot: ChatBot,
// 		@Inject("Channel") channel: Channel,
// 		@Inject("TicketModel") ticketModel: Model<Ticket>
// 	) {
// 		super(model, chatbot, channel, ticketModel);
// 	}

// 	async run(ticket: Ticket, contentFromWpp: string): Promise<void> {
// 		const step = await this.findStep(ticket.currentStep);

// 		const { statusCode, message } = await this.sendMessageBasedOnStep(
// 			ticket,
// 			contentFromWpp,
// 			step.rule
// 		);

// 		const cartValue = ticket.cart.reduce((acc, product) => {
// 			return acc + product.price;
// 		}, 0);

// 		const cartText = ticket.cart
// 			.map((product) => {
// 				`${product.name}\nR$: ${product.price.toFixed(2)}`;
// 			})
// 			.join("\n");

// 		const checkoutText = `${cartText}\nValor total R$ ${cartValue.toFixed(2)}`;

// 		await this.channel.sendMessage(
// 			ticket.from,
// 			`${step.texts[statusCode.toString() as "200" | "400"]}\n${checkoutText}`
// 		);
// 	}
// }
