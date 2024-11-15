export interface Channel {
	sendMessage(chatId: string, text: string): Promise<any>;
}
