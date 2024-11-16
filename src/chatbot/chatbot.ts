import OpenAI from "openai";

export interface ChatBotResponse {
	statusCode: number;
	message?: string;
}
export interface ChatBot {
	sendMessage(
		message: string,
		history: OpenAI.Chat.Completions.ChatCompletionMessageParam[]
	): Promise<string>;
}
