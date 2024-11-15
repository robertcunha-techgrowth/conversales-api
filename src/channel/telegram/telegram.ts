import { AxiosInstance } from "axios";
import { Inject } from "../../common/dependency-injection/inject";
import { Channel } from "../channel";

export class TelegramChannel implements Channel {
	constructor(
		@Inject("TelegramAxios") private readonly instance: AxiosInstance
	) {}

	async sendMessage(chatId: string, text: string) {
		const reponse = await this.instance.post("/sendMessage", {
			chat_id: chatId,
			text,
		});
		return reponse.data;
	}
}
