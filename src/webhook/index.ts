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

// console.log(handler);

export const whatsapp = handler.whatsapp.bind(handler);
export const telegram = handler.telegram.bind(handler);
