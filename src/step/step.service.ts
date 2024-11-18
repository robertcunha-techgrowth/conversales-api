import { Channel } from "../channel/channel";
import { StatusTicket, Ticket } from "../ticket/ticket";
import { ChatGptRoles } from "../chatbot/chatgpt/chatgpt";
import { Step } from "./step.entity";
import { ChatBot, ChatBotResponse } from "../chatbot/chatbot";
import { Model } from "mongoose";
import { Inject } from "../common/dependency-injection/inject";
import { ProductService } from "../product/product.service";

export abstract class StepService {
	constructor(private readonly model: Model<Step>) {}

	abstract run(ticket: Ticket, contentFromWpp: string): Promise<void>;

	protected async findStep(currentStep: number): Promise<Step> {
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
}

export class ListProductsStep extends StepService {
	constructor(
		@Inject("StepModel") model: Model<Step>,
		@Inject("Chatbot") private readonly chatbot: ChatBot,
		@Inject("Channel") private readonly channel: Channel,
		@Inject("ProductService") private readonly productService: ProductService,
		@Inject("TicketModel") private readonly ticketModel: Model<Ticket>
	) {
		super(model);
	}

	async run(ticket: Ticket, contentFromWpp: string) {
		const step = await this.findStep(ticket.currentStep);

		const messageToSend = {
			message: contentFromWpp,
			rule: step.rule,
		};

		const stringfiedMessageToSend = JSON.stringify(messageToSend);

		const contentResponse = await this.chatbot.sendMessage(
			stringfiedMessageToSend
		);

		console.log(`Content response: ${(contentResponse as any).text.value}`);

		ticket.history.push({
			role: ChatGptRoles.User,
			content: stringfiedMessageToSend,
		});

		const { statusCode, message } = JSON.parse(
			(contentResponse as any).text.value
		) as ChatBotResponse;

		console.log(statusCode);
		console.log(message);

		ticket.history.push({
			role: ChatGptRoles.Assistant,
			content: JSON.stringify({
				statusCode,
				message,
			}),
		});

		const products = await this.productService.findAll();
		const productsText = products
			.map((product) => {
				return `${product.name} - ${product.price}\n${product.description}`;
			})
			.join("\n");
		const stepBaseText = step.texts[statusCode.toString() as "200" | "400"];

		await this.channel.sendMessage(
			ticket.from,
			`${stepBaseText}\n${productsText}`
		);

		if (statusCode === 200) {
			await this.ticketModel.findOneAndUpdate(
				{
					_id: ticket._id,
				},
				{
					currentStep: step.isFinalStep
						? ticket.currentStep
						: ticket.currentStep + 1,
					status: step.isFinalStep ? StatusTicket.Closed : StatusTicket.Active,
					history: ticket.history,
				}
			);
		}
	}
}

export class SelectedProductStep extends StepService {
	constructor(
		@Inject("StepModel") model: Model<Step>,
		@Inject("Chatbot") private readonly chatbot: ChatBot,
		@Inject("Channel") private readonly channel: Channel,
		@Inject("ProductService") private readonly productService: ProductService,
		@Inject("TicketModel") private readonly ticketModel: Model<Ticket>
	) {
		super(model);
	}

	async run(ticket: Ticket, contentFromWpp: string): Promise<void> {
		const step = await this.findStep(ticket.currentStep);

		const messageToSend = {
			message: contentFromWpp,
			rule: step.rule,
		};

		const stringfiedMessageToSend = JSON.stringify(messageToSend);

		const contentResponse = await this.chatbot.sendMessage(
			stringfiedMessageToSend
		);

		console.log(`Content response: ${(contentResponse as any).text.value}`);

		ticket.history.push({
			role: ChatGptRoles.User,
			content: stringfiedMessageToSend,
		});

		const { statusCode, message } = JSON.parse(
			(contentResponse as any).text.value
		) as ChatBotResponse;

		console.log(statusCode);
		console.log(message);

		ticket.history.push({
			role: ChatGptRoles.Assistant,
			content: JSON.stringify({
				statusCode,
				message,
			}),
		});

		const product = await this.productService.findOne({
			filter: {
				num: +message,
			},
		});

		const stepBaseText = step.texts[statusCode.toString() as "200" | "400"];

		const checkoutText = `Nome: ${product.name}\nPreço: ${product.price}\nDescrição: ${product.description}`;

		await this.channel.sendMessage(
			ticket.from,
			`${stepBaseText}\n${checkoutText}`
		);

		if (statusCode === 200) {
			await this.ticketModel.findOneAndUpdate(
				{
					_id: ticket._id,
				},
				{
					currentStep: step.isFinalStep
						? ticket.currentStep
						: ticket.currentStep + 1,
					status: step.isFinalStep ? StatusTicket.Closed : StatusTicket.Active,
					history: ticket.history,
				}
			);
		}
	}
}

export class NormalStep extends StepService {
	constructor(
		// coesão foi pro caralho aqui
		// toDo: arruma essa porra
		// cohesion goin to hell here
		// toDo: fix this
		@Inject("StepModel") model: Model<Step>,
		@Inject("Chatbot") private readonly chatbot: ChatBot,
		@Inject("Channel") private readonly channel: Channel,
		@Inject("TicketModel") private readonly ticketModel: Model<Ticket>
	) {
		super(model);
	}

	async run(ticket: Ticket, contentFromWpp: string) {
		const step = await this.findStep(ticket.currentStep);

		const messageToSend = {
			message: contentFromWpp,
			rule: step.rule,
		};

		const stringfiedMessageToSend = JSON.stringify(messageToSend);

		const contentResponse = await this.chatbot.sendMessage(
			stringfiedMessageToSend
		);

		console.log(`Content response: ${(contentResponse as any).text.value}`);

		ticket.history.push({
			role: ChatGptRoles.User,
			content: stringfiedMessageToSend,
		});

		const { statusCode, message } = JSON.parse(
			(contentResponse as any).text.value
		) as ChatBotResponse;

		console.log(statusCode);
		console.log(message);

		await this.channel.sendMessage(
			ticket.from,
			step.texts[statusCode.toString() as "200" | "400"]
		);

		// toDo: return this to chatbot
		// chat bot handle with the update
		if (statusCode === 200) {
			await this.ticketModel.findOneAndUpdate(
				{
					_id: ticket._id,
				},
				{
					currentStep: step.isFinalStep
						? ticket.currentStep
						: ticket.currentStep + 1,
					status: step.isFinalStep ? StatusTicket.Closed : StatusTicket.Active,
					history: ticket.history,
				}
			);
		}
	}
}
