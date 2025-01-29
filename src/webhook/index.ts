require("events").EventEmitter.defaultMaxListeners = 20;
import { ConfigModule } from "../common/config/config.module";
ConfigModule.forRoot({
	envFilePath: ".env",
	isGlobal: true,
});

import { ModuleMetadata } from "../common/dependency-injection/module-metadata";
import { WebhookHandler } from "./webhook.handler";
import { WebhookModule } from "./webhook.module";

const moduleMetadata = new ModuleMetadata();

const { providers } = moduleMetadata.getModuleMetadata(WebhookModule.name);

const handler: WebhookHandler = providers["WebhookHandler"];

export const whatsapp = handler.whatsapp.bind(handler);
export const telegram = handler.telegram.bind(handler);
export const setEfiWebhook = handler.setEfiWebhook.bind(handler);
export const pix = handler.webHookPix.bind(handler);
export const retryContact = handler.retryContact.bind(handler);
export const findTickets = handler.findTickets.bind(handler);
export const sendContactMessage = handler.sendMessage.bind(handler);
export const whatsappValidation = handler.whatsappValidation.bind(handler);
