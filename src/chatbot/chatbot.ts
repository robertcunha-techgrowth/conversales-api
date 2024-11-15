import OpenAI from "openai";
import { ChatBotResponse } from "./chatgpt/chatgpt";

export interface ChatBot {
	sendMessage(
		message: string,
		history: OpenAI.Chat.Completions.ChatCompletionMessageParam[]
	): Promise<ChatBotResponse>;
}
