import { Channel } from "../channel/channel";
import { StatusTicket, Ticket } from "../ticket/ticket.entity";
import { ChatGptRoles } from "../chatbot/chatgpt/chatgpt";
import { Step } from "./step.entity";
import { ChatBot, ChatBotResponse } from "../chatbot/chatbot";
import { Model } from "mongoose";
import { Inject } from "../common/dependency-injection/inject";
import { ProductService } from "../product/product.service";
import { Injectable } from "../common/dependency-injection/injectable";
import { Product } from "../product/product.entity";

export abstract class StepService {
	constructor(
		private readonly model: Model<Step>,
		private readonly chatbot: ChatBot,
		protected readonly channel: Channel,
		protected readonly ticketModel: Model<Ticket>
	) {}

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

	protected async sendMessageBasedOnStep(
		ticket: Ticket,
		contentFromWpp: string,
		rule: string
	) {
		const messageToSend = {
			message: contentFromWpp,
			rule: rule,
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

		const response = JSON.parse(
			(contentResponse as any).text.value
		) as ChatBotResponse;

		ticket.history.push({
			role: ChatGptRoles.Assistant,
			content: JSON.stringify(response),
		});

		return response;
	}

	protected async finishTicket(ticket: Ticket) {
		await this.channel.sendMessage(ticket.from, `Atendimento encerrado.`);
		console.log(ticket._id);
		return this.ticketModel.findOneAndUpdate(
			{
				_id: ticket._id,
			},
			{
				status: StatusTicket.Closed,
				history: ticket.history,
			}
		);
	}

	protected checkFinishCondition(value: string) {
		return value === "2";
	}
}

@Injectable()
export class ListProductsStep extends StepService {
	constructor(
		@Inject(ProductService.name)
		private readonly productService: ProductService,
		@Inject("StepModel") model: Model<Step>,
		@Inject("Chatbot") chatbot: ChatBot,
		@Inject("Channel") channel: Channel,
		@Inject("TicketModel") ticketModel: Model<Ticket>
	) {
		super(model, chatbot, channel, ticketModel);
	}

	async run(ticket: Ticket, contentFromWpp: string) {
		const step = await this.findStep(ticket.currentStep);

		const { statusCode, message } = await this.sendMessageBasedOnStep(
			ticket,
			contentFromWpp,
			step.rule
		);

		if (this.checkFinishCondition(message)) {
			await this.finishTicket(ticket);
			return;
		}

		const routines = {
			"200": this.success.bind(this),
			"400": this.fail.bind(this),
		};

		return routines[statusCode.toString() as "200" | "400"](ticket, step);
	}

	protected async success(ticket: Ticket, step: Step) {
		const stepBaseText = step.texts["200"];
		const products = await this.productService.findAll();
		const productsText = products
			.map((product) => {
				return `${product.num}: ${product.name}`;
			})
			.join("\n");

		await this.channel.sendMessage(
			ticket.from,
			`${stepBaseText}\n${productsText}`
		);

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
				products: products.map((product) => product._id.toString()),
			}
		);
	}

	protected async fail(ticket: Ticket, step: Step) {
		const stepBaseText = step.texts["400"];
		await this.channel.sendMessage(ticket.from, `${stepBaseText}`);
	}
}

@Injectable()
export class SelectedProductStep extends StepService {
	constructor(
		@Inject(ProductService.name)
		private readonly productService: ProductService,
		@Inject("StepModel") model: Model<Step>,
		@Inject("Chatbot") chatbot: ChatBot,
		@Inject("Channel") channel: Channel,
		@Inject("TicketModel") ticketModel: Model<Ticket>
	) {
		super(model, chatbot, channel, ticketModel);
	}

	async run(ticket: Ticket, contentFromWpp: string): Promise<void> {
		const step = await this.findStep(ticket.currentStep);

		const { statusCode, message } = await this.sendMessageBasedOnStep(
			ticket,
			contentFromWpp,
			step.rule
		);

		if (statusCode === 200) {
			return this.success(ticket, step, +message);
		}
		return this.fail(ticket, step);
	}

	async success(ticket: Ticket, step: Step, message: number): Promise<void> {
		const stepBaseText = step.texts["200"];
		const product = await this.productService.findOne({
			filter: {
				num: message,
			},
		});

		ticket.cart.push(product);

		const checkoutText = `${product.name}\nR$ ${product.price.toFixed(2)}\n ${
			product.description
		}`;

		await this.channel.sendMessage(
			ticket.from,
			`${checkoutText}\n${stepBaseText}`
		);

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
				cart: ticket.cart,
			}
		);
	}

	async fail(ticket: Ticket, step: Step): Promise<void> {
		const stepBaseText = step.texts["400"];
		await this.channel.sendMessage(ticket.from, `${stepBaseText}\n`);
	}
}

@Injectable()
export class IntroStep extends StepService {
	constructor(
		@Inject("StepModel") model: Model<Step>,
		@Inject("Chatbot") chatbot: ChatBot,
		@Inject("Channel") channel: Channel,
		@Inject("TicketModel") ticketModel: Model<Ticket>
	) {
		super(model, chatbot, channel, ticketModel);
	}

	async run(ticket: Ticket, contentFromWpp: string) {
		const step = await this.findStep(ticket.currentStep);

		const { statusCode, message } = await this.sendMessageBasedOnStep(
			ticket,
			contentFromWpp,
			step.rule
		);

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

@Injectable()
export class CollectData extends StepService {
	constructor(
		@Inject("StepModel") model: Model<Step>,
		@Inject("Chatbot") chatbot: ChatBot,
		@Inject("Channel") channel: Channel,
		@Inject("TicketModel") ticketModel: Model<Ticket>
	) {
		super(model, chatbot, channel, ticketModel);
	}

	async run(ticket: Ticket, contentFromWpp: string): Promise<void> {
		const step = await this.findStep(ticket.currentStep);

		const { statusCode, message } = await this.sendMessageBasedOnStep(
			ticket,
			contentFromWpp,
			step.rule
		);

		const baseText = step.texts[statusCode.toString() as "200" | "400"];

		await this.channel.sendMessage(
			ticket.from,
			step.texts[statusCode.toString() as "200" | "400"]
		);

		if (statusCode === 200) {
			ticket.user[step.userProperty] = message;
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
					user: ticket.user,
				}
			);
		}
	}
}

@Injectable()
export class CheckoutStep extends StepService {
	constructor(
		@Inject("StepModel") model: Model<Step>,
		@Inject("Chatbot") chatbot: ChatBot,
		@Inject("Channel") channel: Channel,
		@Inject("TicketModel") ticketModel: Model<Ticket>
	) {
		super(model, chatbot, channel, ticketModel);
	}

	async run(ticket: Ticket, contentFromWpp: string): Promise<void> {
		const step = await this.findStep(ticket.currentStep);

		const { statusCode, message } = await this.sendMessageBasedOnStep(
			ticket,
			contentFromWpp,
			step.rule
		);

		const cartValue = ticket.cart.reduce((acc, product) => {
			return acc + product.price;
		}, 0);

		const cartText = ticket.cart
			.map((product) => {
				`${product.name}\nR$: ${product.price.toFixed(2)}`;
			})
			.join("\n");

		const checkoutText = `${cartText}\nValor total R$ ${cartValue.toFixed(2)}`;

		await this.channel.sendMessage(
			ticket.from,
			`${step.texts[statusCode.toString() as "200" | "400"]}\n${checkoutText}`
		);
	}
}

@Injectable()
export class ConfirmStep extends StepService {
	constructor(
		@Inject("StepModel") model: Model<Step>,
		@Inject("Chatbot") chatbot: ChatBot,
		@Inject("Channel") channel: Channel,
		@Inject("TicketModel") ticketModel: Model<Ticket>
	) {
		super(model, chatbot, channel, ticketModel);
	}

	async run(ticket: Ticket, contentFromWpp: string): Promise<void> {
		enum ConfirmStepEnum {
			YES = "1",
			FINISH_CONTACT = "2",
		}
		const step = await this.findStep(ticket.currentStep);

		const { statusCode, message } = await this.sendMessageBasedOnStep(
			ticket,
			contentFromWpp,
			step.rule
		);

		if (message === ConfirmStepEnum.FINISH_CONTACT) {
			await this.finishTicket(ticket);
		} else if (message === ConfirmStepEnum.YES) {
			const cartValue = ticket.cart.reduce((acc, product) => {
				return acc + product.price;
			}, 0);

			const cartText = ticket.cart
				.map((product) => {
					`${product.name}\nR$: ${product.price.toFixed(2)}`;
				})
				.join("\n");

			const checkoutText = `${cartText}\nValor total R$ ${cartValue.toFixed(
				2
			)}`;

			await this.channel.sendMessage(ticket.from, checkoutText);

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

	// private async backToProducts(ticket: Ticket, stepToReturn: number) {
	// 	await this.channel.sendMessage(
	// 		ticket.from,
	// 		`Voltando para a lista de produtos.`
	// 	);

	// 	const { products } = ticket;

	// 	const productsText = (products as Product[])
	// 		.map((product) => {
	// 			return `${product.num}: ${product.name}`;
	// 		})
	// 		.join("\n");

	// 	await this.ticketModel.findOneAndUpdate(
	// 		{
	// 			_id: ticket._id,
	// 		},
	// 		{
	// 			history: ticket.history,
	// 			step: stepToReturn,
	// 		},
	// 		{
	// 			populate: {
	// 				path: "products",
	// 			},
	// 		}
	// 	);

	// 	await this.channel.sendMessage(ticket.from, `${productsText}`);
	// }
}
