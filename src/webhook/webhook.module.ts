import { ModuleHandler } from "../common/dependency-injection/module";
import { ClassProvider } from "../common/dependency-injection/provider";
import { TicketModule } from "../ticket/ticket.module";
import { WebhookHandler } from "./webhook.handler";
import { WebhookWhatsappService } from "./webhook-whatsapp.service";
import { WebhookTelegramService } from "./webhook-telegram.service";
import { StepModule } from "../step/step.module";
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

@ModuleHandler({
	imports: [TicketModule, StepModule],
	// controllers: [WebhookControllerProvider],
	providers: [
		WebhookWhatsappServiceProvider,
		WebhookTelegramServiceProvider,
		WebhookControllerProvider,
	],
	exports: [],
})
export class WebhookModule {}
