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

describe("WebhookHandler", () => {
	let mongoMemoryServer: MongoMemoryServer;
	let controller: WebhookHandler;

	beforeAll(async () => {
		mongoMemoryServer = await MongoMemoryServer.create();
		const mongoUri = mongoMemoryServer.getUri();

		await MongooseModule.forRoot(mongoUri);
		const module = new ModuleHandlerTest({
			imports: [WebhookModule],
		});

		const moduleName = WebhookModule.name;
		controller = module.get<WebhookHandler>(moduleName, "WebhookHandler");
	});

	afterAll(async () => {
		await MongooseModule.finish();
		await mongoMemoryServer.stop();
	});

	describe("telegram", () => {
		it("should return statusCode 200", async () => {
			// Arrange
			const event = {
				body: JSON.stringify({}),
				headers: {
					"x-telegram-bot-api-secret-token": process.env.API_KEY,
				},
			};

			// Act

			await controller.telegram(event);

			// Assert
		});
	});
});
