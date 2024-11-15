import { WebhookService } from "./webhook.service";
import { Inject } from "../common/dependency-injection/inject";
import { XApiKeyGuard } from "../common/auth/x-api-key.guard";
import { WebhookWhatsappData } from "./webhook-whatsapp.service";
import { Controller } from "../common/dependency-injection/controller.decorator";
import { TelegramWebhookGuard } from "../common/auth/telegram-webhook.guard";
import { MongooseModule } from "../common/database/mongoose.module";

@Controller()
export class WebhookHandler {
	constructor(
		@Inject("WebhookTelegram")
		private readonly webhookTelegram: WebhookService,
		@Inject("WebhookWhatsapp")
		private readonly webhookWhatsApp: WebhookService
	) {}

	async telegram(event: any) {
		try {
			TelegramWebhookGuard.canActivate(event);
			const body = JSON.parse(event.body);
			await this.webhookTelegram.webhook(body);
			await MongooseModule.finish();
			return {
				statusCode: 200,
				message: "Go Serverless v3.0! Your function executed successfully!",
			};
		} catch (err: any) {
			await MongooseModule.finish();

			return {
				statusCode: err.statusCode ?? 500,
				body: {
					message: err.message,
				},
			};
		}
	}

	async whatsapp(event: any) {
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
			await MongooseModule.finish();
			return {
				statusCode: err.statusCode ?? 500,
				body: {
					message: err.message,
				},
			};
		}
	}
}
