import { ModuleHandler } from "../common/dependency-injection/module";
import { ClassProvider } from "../common/dependency-injection/provider";
import { TicketModule } from "../ticket/ticket.module";
import { WebhookHandler } from "./webhook.handler";
import { WebhookWhatsappService } from "./webhook-whatsapp.service";
import { WebhookTelegramService } from "./webhook-telegram.service";
import { StepModule } from "../step/step.module";
import { ProductModule } from "../product/product.module";
import { ChatGptModule } from "../chatbot/chatgpt/chatgpt.module";
import { TelegramModule } from "../channel/telegram/telegram.module";
import { CompanyModule } from "../company/company.module";
import { PaymentModule } from "../payment/infrastructure/payment.module";
import { PixWebhookService } from "./pix-webhook-service";
const WebhookControllerProvider = new ClassProvider({
	provide: "WebhookHandler",
	useClass: WebhookHandler,
});

const WebhookWhatsappServiceProvider = new ClassProvider({
	provide: "WebhookWhatsapp",
	useClass: WebhookWhatsappService,
});

const WebhookTelegramServiceProvider = new ClassProvider({
	provide: "WebhookTelegram",
	useClass: WebhookTelegramService,
});

const PixWebhookServiceProvider = new ClassProvider({
	provide: PixWebhookService.name,
	useClass: PixWebhookService,
});

@ModuleHandler({
	imports: [
		TicketModule,
		StepModule,
		ProductModule,
		ChatGptModule,
		TelegramModule,
		CompanyModule,
		PaymentModule,
		CompanyModule,
	],
	// controllers: [WebhookControllerProvider],
	providers: [
		WebhookWhatsappServiceProvider,
		WebhookTelegramServiceProvider,
		PixWebhookServiceProvider,
		WebhookControllerProvider,
	],
	exports: [],
})
export class WebhookModule {}
