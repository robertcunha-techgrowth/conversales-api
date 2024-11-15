import { AxiosInstance } from "axios";
import { Channel } from "../channel";
import { Injectable } from "../../common/dependency-injection/injectable";
import { Inject } from "../../common/dependency-injection/inject";

export interface WhatsapBussinessResponse {
	messaging_product: string;
	contacts: [
		{
			input: string;
			wa_id: string;
		}
	];
	messages: [
		{
			id: string;
		}
	];
}

export interface WhatsappBusinessButton {
	type: string;
	reply: {
		id: string;
		title: string;
	};
}

export interface WhatsapBusiness extends Channel {
	sendButtonMessage(
		chatId: string,
		text: string,
		buttons: WhatsappBusinessButton[]
	): Promise<WhatsapBussinessResponse>;
}

@Injectable()
export class WhatsappChannel implements WhatsapBusiness {
	constructor(
		@Inject("WhatsappAxiosInstance") private readonly instance: AxiosInstance,
		@Inject("WhatsappNumberId") private readonly wppNumberId: string
	) {}

	async sendMessage(
		chatId: string,
		text: string
	): Promise<WhatsapBussinessResponse> {
		const response = await this.instance.post(`${this.wppNumberId}/messages`, {
			messaging_product: "whatsapp",
			to: chatId,
			type: "text",
			text: {
				body: text,
			},
		});
		return response.data;
	}

	async sendButtonMessage(
		chatId: string,
		text: string,
		buttons: WhatsappBusinessButton[]
	) {
		const response = await this.instance.post(`${this.wppNumberId}/messages`, {
			messaging_product: "whatsapp",
			to: chatId,
			type: "interactive",
			interactive: {
				type: "button",
				body: {
					text: text,
				},
				action: {
					buttons,
				},
			},
		});
		return response.data;
	}
}
