import { ConfigModule } from "../common/config/config.module";
ConfigModule.forRoot({
	envFilePath: ".env.test",
	isGlobal: true,
});

import { MongoMemoryServer } from "mongodb-memory-server";
import { ModuleHandlerTest } from "../common/dependency-injection/module-test";
import { WebhookHandler } from "./webhook.handler";
import { MongooseModule } from "../common/database/mongoose.module";
import { WebhookModule } from "./webhook.module";
import { WebhookTelegramData } from "./webhook-telegram.service";
import { Step, StepKind } from "../step/step.entity";
import { Model } from "mongoose";
import { StepModule } from "../step/step.module";
import { ChatGptModule } from "../chatbot/chatgpt/chatgpt.module";
import { TelegramModule } from "../channel/telegram/telegram.module";
import { AxiosInstance } from "axios";
import OpenAI from "openai";
import { APIPromise } from "openai/core";
import { ChatGptRoles } from "../chatbot/chatgpt/chatgpt";
import {
	Message,
	MessageContent,
} from "openai/resources/beta/threads/messages";
import { Ticket } from "../ticket/ticket.entity";
import { TicketModule } from "../ticket/ticket.module";

describe("WebhookHandler", () => {
	let mongoMemoryServer: MongoMemoryServer;
	let controller: WebhookHandler;
	let stepModel: Model<Step>;
	let openai: OpenAI;
	let telegramAxios: AxiosInstance;
	let ticketModel: Model<Ticket>;

	beforeAll(async () => {
		mongoMemoryServer = await MongoMemoryServer.create();
		const mongoUri = mongoMemoryServer.getUri();

		await MongooseModule.forRoot(mongoUri);
		const module = new ModuleHandlerTest({
			imports: [WebhookModule],
		});

		const moduleName = WebhookModule.name;
		controller = module.get<WebhookHandler>(moduleName, "WebhookHandler");
		stepModel = module.get<Model<Step>>(StepModule.name, "StepModel");
		openai = module.get<OpenAI>(ChatGptModule.name, "OpenAI");
		telegramAxios = module.get<AxiosInstance>(
			TelegramModule.name,
			"TelegramAxios"
		);
		ticketModel = module.get<Model<Ticket>>(TicketModule.name, "TicketModel");
	});

	afterEach(async () => {
		await stepModel.deleteMany({});
		await ticketModel.deleteMany({});
	});

	afterAll(async () => {
		await MongooseModule.finish();
		await mongoMemoryServer.stop();
	});

	describe("telegram", () => {
		it("INTRO_STEP should return 200", async () => {
			jest.spyOn(openai.beta.threads, "create").mockResolvedValue({
				id: "thread-1",
				object: "thread",
			} as unknown as APIPromise<any>);

			jest.spyOn(openai.beta.threads.messages, "create").mockResolvedValue({
				id: "message-1",
				object: "message",
				created: 1234567890,
				choices: [],
			} as unknown as APIPromise<any>);

			jest.spyOn(openai.beta.threads.runs, "create").mockResolvedValue({
				id: "run-1",
			} as any);

			jest.spyOn(openai.beta.threads.runs, "retrieve").mockResolvedValue({
				status: "completed",
			} as any);

			jest.spyOn(telegramAxios, "post").mockResolvedValue({});

			const messageContent: MessageContent = {
				text: {
					annotations: [],
					value: `{ "statusCode": 200, "message": "Intro step is going ok"}`,
				},
				type: "text",
			};

			const listMessages: Message[] = [
				{
					content: [messageContent],
					role: ChatGptRoles.Assistant,
					id: "",
					assistant_id: "",
					attachments: [],
					completed_at: 0,
					created_at: 0,
					incomplete_at: 0,
					incomplete_details: undefined,
					metadata: undefined,
					object: "thread.message",
					run_id: "",
					status: "in_progress",
					thread_id: "",
				},
			];

			jest.spyOn(openai.beta.threads.messages, "list").mockResolvedValue({
				data: listMessages,
			} as any);

			jest.spyOn(telegramAxios, "post").mockResolvedValue({});

			const webhookTelegramData: WebhookTelegramData = {
				message: {
					message_id: 45784,
					from: {
						id: 32,
						is_bot: false,
						first_name: "test",
						username: "userTest",
					},
					text: "Hello, this is my test",
					chat: {
						id: "454875211",
					},
				},
			};

			const step: Step = {
				stepNumber: 1,
				rule: "None",
				// texts: {
				// 	"200": "Hello, this is my test",
				// 	"400": "Failure",
				// },
				// isFirstStep: false,
				// isFinalStep: false,
				kind: StepKind.GREETING,
			};
			await stepModel.create(step);
			// Arrange
			const event = {
				body: JSON.stringify(webhookTelegramData),
				headers: {
					"x-telegram-bot-api-secret-token": process.env.API_KEY,
				},
			};

			// Act

			await controller.telegram(event);

			// Assert
		});

		it("LIST_PRODUCTS_STEP should return 200", async () => {
			jest.spyOn(openai.beta.threads, "create").mockResolvedValue({
				id: "thread-1",
				object: "thread",
			} as unknown as APIPromise<any>);

			jest.spyOn(openai.beta.threads.messages, "create").mockResolvedValue({
				id: "message-1",
				object: "message",
				created: 1234567890,
				choices: [],
			} as unknown as APIPromise<any>);

			jest.spyOn(openai.beta.threads.runs, "create").mockResolvedValue({
				id: "run-1",
			} as any);

			jest.spyOn(openai.beta.threads.runs, "retrieve").mockResolvedValue({
				status: "completed",
			} as any);

			jest.spyOn(telegramAxios, "post").mockResolvedValue({});

			const messageContent: MessageContent = {
				text: {
					annotations: [],
					value: `{ "statusCode": 200, "message": "Intro step is going ok"}`,
				},
				type: "text",
			};

			const listMessages: Message[] = [
				{
					content: [messageContent],
					role: ChatGptRoles.Assistant,
					id: "",
					assistant_id: "",
					attachments: [],
					completed_at: 0,
					created_at: 0,
					incomplete_at: 0,
					incomplete_details: undefined,
					metadata: undefined,
					object: "thread.message",
					run_id: "",
					status: "in_progress",
					thread_id: "",
				},
			];

			jest.spyOn(openai.beta.threads.messages, "list").mockResolvedValue({
				data: listMessages,
			} as any);

			jest.spyOn(telegramAxios, "post").mockResolvedValue({});

			const webhookTelegramData: WebhookTelegramData = {
				message: {
					message_id: 45784,
					from: {
						id: 32,
						is_bot: false,
						first_name: "test",
						username: "userTest",
					},
					text: "Hello, this is my test",
					chat: {
						id: "454875211",
					},
				},
			};

			const step: Step = {
				stepNumber: 1,
				rule: "None",
				// texts: {
				// 	"200": "Hello, this is my test",
				// 	"400": "Failure",
				// },
				// isFirstStep: false,
				// isFinalStep: false,
				kind: StepKind.LIST_PRODUCTS,
			};
			await stepModel.create(step);
			// Arrange
			const event = {
				body: JSON.stringify(webhookTelegramData),
				headers: {
					"x-telegram-bot-api-secret-token": process.env.API_KEY,
				},
			};

			// Act

			await controller.telegram(event);
		});
	});
});
