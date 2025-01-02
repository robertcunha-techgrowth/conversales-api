import { WebhookService } from "./webhook.service";
import { Inject } from "../common/dependency-injection/inject";
import { XApiKeyGuard } from "../common/auth/x-api-key.guard";
import { WebhookWhatsappData } from "./webhook-whatsapp.service";
import { Controller } from "../common/dependency-injection/controller.decorator";
import { TelegramApiGuard } from "../common/auth/telegram-webhook.guard";
import { MongooseModule } from "../common/database/mongoose.module";
import { PixWebhookService } from "./pix-webhook-service";
import { Model } from "mongoose";
import { Company } from "../company/company.entity";
import { IsString } from "class-validator";
import { Ticket } from "../ticket/ticket.entity";

export type APIGatewayProxyEvent = {
	pathParameters?: { [key: string]: string | null };
	queryStringParameters?: { [key: string]: string | null };
	body?: string | null;
	httpMethod: string;
	headers: { [key: string]: string | undefined };
	isBase64Encoded: boolean;
	path: string;
	resource: string;
	requestContext: {
		accountId: string;
		resourceId: string;
		stage: string;
		requestId: string;
		identity: {
			cognitoIdentityPoolId?: string | null;
			accountId?: string | null;
			cognitoIdentityId?: string | null;
			caller?: string | null;
			apiKey?: string | null;
			sourceIp: string;
			userAgent: string;
		};
		authorizer?: { [key: string]: any };
		protocol: string;
		requestTime: string;
		requestTimeEpoch: number;
		resourcePath: string;
		httpMethod: string;
		path: string;
	};
};

export enum Channels {
	WHATSAPP = "WHATSAPP",
	TELEGRAM = "TELEGRAM",
}

export class RetryContactPathParamsDto {
	@IsString()
	ticketId: string;

	@IsString()
	channel: string;
}

@Controller()
export class WebhookHandler {
	constructor(
		@Inject("WebhookTelegram")
		private readonly webhookTelegram: WebhookService,
		@Inject("WebhookWhatsapp")
		private readonly webhookWhatsApp: WebhookService,
		@Inject(PixWebhookService.name)
		private readonly paymentWebhook: PixWebhookService,
		@Inject("CompanyModel") private readonly companyModel: Model<Company>,
		@Inject("TicketModel") private readonly ticketModel: Model<Ticket>
	) {}

	@TelegramApiGuard()
	async telegram(event: APIGatewayProxyEvent) {
		const body = JSON.parse(event.body);
		const { companyId } = event.pathParameters;
		await this.webhookTelegram.webhook(body, companyId);
		return {
			statusCode: 200,
			message: "Go Serverless v3.0! Your function executed successfully!",
		};
	}

	async whatsapp(event: APIGatewayProxyEvent) {
		await MongooseModule.forRoot(process.env.MONGO_URI);
		try {
			const body = JSON.parse(event.body) as WebhookWhatsappData;
			const { companyId } = event.pathParameters;

			await this.webhookWhatsApp.webhook(body, companyId);
			await MongooseModule.finish();
			return {
				statusCode: 200,
				body: JSON.stringify(
					{
						message: "Go Serverless v3.0! Your function executed successfully!",
					},
					null,
					2
				),
			};
		} catch (err: any) {
			console.log(err);
			await MongooseModule.finish();
			const status = err.statusCode ?? 500;

			return {
				statusCode: status,
				status,
				body: JSON.stringify({
					message: err.message,
					statusCode: status,
					status: status,
				}),
			};
		}
	}

	async setEfiWebhook(event: APIGatewayProxyEvent) {
		const ip = event.headers["x-forwarded-for"];
		const { hmac, companyId } = event.pathParameters;
		const company = await this.companyModel.findById(companyId);
		console.log(`Current HMAC: ${hmac}\nDesired: ${process.env.EFI_HMAC}`);
		if (!company) {
			return {
				statusCode: 404,
				message: "Company not found.",
			};
		}
		if (ip !== process.env.EFI_ALLOWED_IP) {
			console.log(`Current IP: ${ip}\nDesired: ${process.env.EFI_ALLOWED_IP}`);
			return {
				statusCode: 401,
				body: JSON.stringify({
					message: "Unauthorized",
				}),
			};
		}
		if (hmac !== process.env.EFI_HMAC) {
			return {
				statusCode: 401,
				body: JSON.stringify({
					message: "Unauthorized",
				}),
			};
		}
		return "200";
	}

	async webHookPix(event: APIGatewayProxyEvent) {
		const ip = event.headers["x-forwarded-for"];
		const { hmac } = event.pathParameters;
		const body = JSON.parse(event.body);
		const { EFI_ALLOWED_IP, EFI_HMAC } = process.env;
		if (ip !== EFI_ALLOWED_IP) {
			return {
				statusCode: 401,
				body: JSON.stringify({
					message: "Unauthorized",
				}),
			};
		}
		if (hmac !== EFI_HMAC) {
			return {
				statusCode: 401,
				body: JSON.stringify({
					message: "Unauthorized",
				}),
			};
		}
		const { pix } = body;
		return this.paymentWebhook.run(pix);
	}

	@XApiKeyGuard()
	async retryContact(event: APIGatewayProxyEvent) {
		const { ticketId, channel } =
			event.pathParameters as unknown as RetryContactPathParamsDto;

		if (channel === Channels.WHATSAPP) {
			return this.webhookWhatsApp.retryContact(ticketId);
		}

		return this.webhookTelegram.retryContact(ticketId);
	}

	@XApiKeyGuard()
	async findTickets(event: APIGatewayProxyEvent) {
		const { filter, options } = event.queryStringParameters ?? {
			filter: JSON.stringify({}),
			options: JSON.stringify({}),
		};
		const tickets = await this.ticketModel.find(
			JSON.parse(filter),
			null,
			JSON.parse(options)
		);
		return {
			statusCode: 200,
			body: JSON.stringify(tickets),
		};
	}
}
