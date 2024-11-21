import { ModuleHandler } from "../common/dependency-injection/module";
import {
	ClassProvider,
	FactoryProvider,
} from "../common/dependency-injection/provider";
import { TicketModule } from "../ticket/ticket.module";
import { WebhookHandler } from "./webhook.handler";
import { WebhookWhatsappService } from "./webhook-whatsapp.service";
import { WebhookTelegramService } from "./webhook-telegram.service";
import { StepModule } from "../step/step.module";
import { ProductModule } from "../product/product.module";
import { IntroStep, StepService } from "../step/step.service";
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

// const StepsProvider = new FactoryProvider({
// 	provide: "Steps",
// 	inject: [NormalStep, ListProductsStep, SelectedProductStep],
// 	useFactory(
// 		normalStep: StepService,
// 		listProductsStep: StepService,
// 		selectedProductStep: StepService
// 	) {
// 		return {
// 			"1": normalStep,
// 			"2": listProductsStep,
// 			"3": selectedProductStep,
// 		};
// 	},
// });

@ModuleHandler({
	imports: [TicketModule, StepModule, ProductModule],
	// controllers: [WebhookControllerProvider],
	providers: [
		WebhookWhatsappServiceProvider,
		WebhookTelegramServiceProvider,
		WebhookControllerProvider,
	],
	exports: [],
})
export class WebhookModule {}
