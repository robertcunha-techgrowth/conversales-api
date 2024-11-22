import { MongooseModule } from "./common/database/mongoose.module";
import { ModuleHandler } from "./common/dependency-injection/module";
import { WebhookModule } from "./webhook/webhook.module";

MongooseModule.forRoot(process.env.MONGO_URI);
@ModuleHandler({
	imports: [WebhookModule],
})
export class AppModule {}
