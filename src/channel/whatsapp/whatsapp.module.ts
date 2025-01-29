import axios from "axios";
import { ModuleHandler } from "../../common/dependency-injection/module";
import {
	ClassProvider,
	FactoryProvider,
} from "../../common/dependency-injection/provider";
import { WhatsappChannel } from "./whatsapp";

const WhatsappAxiosInstanceProvider = new FactoryProvider({
	provide: "WhatsappAxiosInstance",
	useFactory: () => {
		return axios.create({
			baseURL: process.env.WPP_API_URL,
			headers: {
				Authorization: `Bearer ${process.env.WPP_API_TOKEN}`,
			},
		});
	},
});

const WhatsappNumberIdProvider = new FactoryProvider({
	provide: "WhatsappNumberId",
	useFactory: () => {
		return process.env.WPP_NUMBER_ID;
	},
});

const WhatsappBusinessApiProvider = new ClassProvider({
	provide: "ChannelWhatsapp",
	useClass: WhatsappChannel,
});

@ModuleHandler({
	providers: [
		WhatsappAxiosInstanceProvider,
		WhatsappNumberIdProvider,
		WhatsappBusinessApiProvider,
	],
	exports: [WhatsappBusinessApiProvider],
})
export class WhatsappModule {}
