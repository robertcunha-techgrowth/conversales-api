import axios from "axios";
import { ModuleHandler } from "../../common/dependency-injection/module";
import {
	FactoryProvider,
	ClassProvider,
} from "../../common/dependency-injection/provider";
import { TelegramChannel } from "./telegram";

const TelegramAxiosProvider = new FactoryProvider({
	provide: "TelegramAxios",
	useFactory: () => {
		const baseUrl = process.env["TELEGRAM_BASE_URL"];
		const token = process.env["TELEGRAM_BOT_TOKEN"];
		return axios.create({
			baseURL: `${baseUrl}/bot${token}`,
		});
	},
});

const TelegramChannelProvider = new ClassProvider({
	provide: "Channel",
	useClass: TelegramChannel,
});

@ModuleHandler({
	providers: [TelegramAxiosProvider, TelegramChannelProvider],
	exports: [TelegramChannelProvider],
})
export class TelegramModule {}
