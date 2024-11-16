import { Channel } from "../channel/channel";
import { StatusTicket, Ticket } from "../ticket/ticket";
import { ChatGptRoles } from "../chatbot/chatgpt/chatgpt";
import { Step } from "./step.entity";
import { ChatBot } from "../chatbot/chatbot";
import { Model } from "mongoose";
import { Inject } from "../common/dependency-injection/inject";
import { ChatCompletionMessageParam } from "openai/resources";

export interface StepService {
	run(ticket: Ticket, contentFromWpp: string): Promise<void>;
}

export class NormalStep implements StepService {
	constructor(
		// coesão foi pro caralho aqui
		// toDo: arruma essa porra
		// cohesion goin to hell here
		// toDo: fix this
		@Inject("StepModel") private readonly model: Model<Step>,
		@Inject("Chatbot") private readonly chatbot: ChatBot,
		@Inject("Channel") private readonly channel: Channel,
		@Inject("TicketModel") private readonly ticketModel: Model<Ticket>,
		@Inject("Prompt") private readonly prompt: string
	) {}

	private async startPrompt() {
		const config = {
			content: this.prompt,
			role: ChatGptRoles.System,
		};
		const history: ChatCompletionMessageParam[] = [];
		await this.chatbot.sendMessage(config.content, history);
		return history;
	}

	async run(ticket: Ticket, contentFromWpp: string) {
		console.log(ticket);
		const step = await this.findStep(ticket.currentStep);

		const history = await this.firstStep(step);

		if (history) {
			ticket.history = history;
		}

		const contentResponse = await this.chatbot.sendMessage(
			JSON.stringify({
				message: contentFromWpp,
				rule: step.rule,
			}),
			ticket.history
		);

		const { statusCode } = JSON.parse(contentResponse);

		console.log(statusCode);

		await this.channel.sendMessage(
			ticket.from,
			step.texts[statusCode.toString() as "200" | "400"]
		);

		// toDo: return this to chatbot
		// chat bot handle with the update
		if (statusCode === 200) {
			await this.ticketModel.findOneAndUpdate(
				{
					documentId: ticket.documentId,
				},
				{
					step: ticket.isFinalStep
						? ticket.currentStep
						: ticket.currentStep + 1,
					status: ticket.isFinalStep
						? StatusTicket.Closed
						: StatusTicket.Active,
					history: ticket.history,
				}
			);
		}
	}

	private async findStep(currentStep: number): Promise<Step> {
		const step = await this.model
			.findOne<Step>({
				stepNumber: currentStep,
			})
			.lean();

		if (!step) {
			throw {
				statusCode: 404,
				body: {
					message: "Step not found.",
				},
			};
		}
		return step;
	}

	private async firstStep(step: Step) {
		if (step.isFirstStep) {
			const history = await this.startPrompt();
			return history;
		}
		return null;
	}
}

// export class ListProductsStep implements StepService {
// 	constructor(
// 		private readonly model: Model<Step>,
// 		private readonly chatbot: ChatBot,
// 		private readonly channel: WhatsapBusiness,
// 		private readonly modelTicket: Model<Ticket>,
// 		private readonly productModel: Model<Product>
// 	) {}

// 	async run(ticket: Ticket, contentFromWpp: string) {
// 		const step = await this.model.findOne<Step>({
// 			stepNumber: ticket.currentStep,
// 		});

// 		const { statusCode } = await this.chatbot.sendMessage(
// 			JSON.stringify({
// 				message: contentFromWpp,
// 				rules: step.rules,
// 			})
// 		);

// 		const products = await this.productModel.find().lean();

// 		if (statusCode === 200) {
// 			await this.modelTicket.findOneAndUpdate(
// 				{
// 					documentId: ticket.documentId,
// 				},
// 				{
// 					step: ticket.isFinalStep
// 						? ticket.currentStep
// 						: ticket.currentStep + 1,
// 					status: ticket.isFinalStep
// 						? StatusTicket.Closed
// 						: StatusTicket.Active,
// 				}
// 			);

// 			await this.channel.sendButtonMessage(
// 				ticket.userPhone,
// 				step.texts[statusCode],
// 				products.map<WhatsappBusinessButton>((product) => ({
// 					type: "product",
// 					reply: {
// 						id: product._id.toString(),
// 						title: product.name,
// 					},
// 				}))
// 			);
// 		} else {
// 			await this.channel.sendMessage(
// 				ticket.userPhone,
// 				step.texts[statusCode as 400]
// 			);
// 		}
// 	}
// }
