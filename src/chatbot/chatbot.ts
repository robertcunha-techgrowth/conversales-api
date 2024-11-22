import OpenAI from "openai";

export interface ChatBotResponse {
	statusCode: number;
	message?: string;
}

export interface ChatBotHistory {
	role: string;
	content: string;
}
export interface ChatBot {
	sendMessage(message: string): Promise<string>;
}
