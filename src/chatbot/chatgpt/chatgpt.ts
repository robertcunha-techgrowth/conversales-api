import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources";
import { Injectable } from "../../common/dependency-injection/injectable";
import { Inject } from "../../common/dependency-injection/inject";
import { ChatBot, ChatBotResponse } from "../chatbot";

export enum ChatGptRoles {
	User = "user",
	Assistant = "assistant",
	System = "system",
}

@Injectable()
export class ChatGpt implements ChatBot {
	constructor(
		@Inject("ChatGptModel") private readonly chatgptModel: string,
		@Inject("OpenAI") private readonly openai: OpenAI // @Inject("History") // private readonly history: OpenAI.Chat.Completions.ChatCompletionMessageParam[]
	) {}

	async sendMessage(
		message: string,
		history: OpenAI.Chat.Completions.ChatCompletionMessageParam[]
	): Promise<string> {
		const completion = await this.gptSendMessage(
			message,
			ChatGptRoles.User,
			history
		);
		const usage = completion.usage?.total_tokens;
		console.log(`Total tokens used: ${usage}`);
		const content = completion.choices[0].message.content;
		const config: ChatCompletionMessageParam = {
			content: content,
			role: ChatGptRoles.Assistant,
		};
		history.push(config);
		console.log(content);
		return content;
	}

	private async gptSendMessage(
		message: string,
		role: ChatGptRoles,
		history: OpenAI.Chat.Completions.ChatCompletionMessageParam[]
	) {
		history.push({
			content: message,
			role: role,
		});
		return this.openai.chat.completions.create({
			model: this.chatgptModel,
			messages: history,
		});
	}
}
