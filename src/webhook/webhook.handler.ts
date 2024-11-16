import { WebhookService } from "./webhook.service";
import { Inject } from "../common/dependency-injection/inject";
import { XApiKeyGuard } from "../common/auth/x-api-key.guard";
import { WebhookWhatsappData } from "./webhook-whatsapp.service";
import { Controller } from "../common/dependency-injection/controller.decorator";
import {
	TelegramApiGuard,
	TelegramWebhookGuard,
} from "../common/auth/telegram-webhook.guard";
import { MongooseModule } from "../common/database/mongoose.module";

@Controller()
export class WebhookHandler {
	constructor(
		@Inject("WebhookTelegram")
		private readonly webhookTelegram: WebhookService,
		@Inject("WebhookWhatsapp")
		private readonly webhookWhatsApp: WebhookService
	) {}

	@TelegramApiGuard()
	async telegram(event: any) {
		await MongooseModule.forRoot(process.env.MONGO_URI);
		try {
			const body = JSON.parse(event.body);
			await this.webhookTelegram.webhook(body);
			await MongooseModule.finish();
			return {
				statusCode: 200,
				message: "Go Serverless v3.0! Your function executed successfully!",
			};
		} catch (err: any) {
			console.log(err);

			await MongooseModule.finish();

			const status = err.statusCode ?? 500;

			return {
				statusCode: status,
				headers: { "Content-Type": "application/json" },
				body: {
					message: err.message,
					statusCode: status,
					status,
				},
			};
		}
	}

	async whatsapp(event: any) {
		await MongooseModule.forRoot(process.env.MONGO_URI);
		try {
			XApiKeyGuard.canActivate(event);
			const body = JSON.parse(event.body) as WebhookWhatsappData;

			await this.webhookWhatsApp.webhook(body);
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
}
