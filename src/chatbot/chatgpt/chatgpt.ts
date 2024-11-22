import OpenAI from "openai";
import { Injectable } from "../../common/dependency-injection/injectable";
import { Inject } from "../../common/dependency-injection/inject";
import { ChatBot } from "../chatbot";

export enum ChatGptRoles {
	User = "user",
	Assistant = "assistant",
	System = "system",
}

@Injectable()
export class ChatGpt implements ChatBot {
	constructor(
		@Inject("OpenAI") private readonly openai: OpenAI,
		@Inject("AssistantId") private readonly assistantId: string
	) {}

	async sendMessage(message: string): Promise<string> {
		const thread = await this.createThread();
		const threadId = thread.id;
		await this.addMessageToThread(threadId, message);
		const run = await this.threadRun(threadId, this.assistantId);
		await this.checkRunStatus(threadId, run.id);
		// Step 5: Retrieve and return the assistant's response
		const assistantMessage = await this.getAssistantResponse(threadId);
		// toDo: the return of this shit is fucking wrong
		// should fix this shit
		return assistantMessage as any;
	}

	private async createThread() {
		const response = await this.openai.beta.threads.create();
		console.log("Thread criada com sucesso:", response);
		return response;
	}

	private async addMessageToThread(threadId: string, message: string) {
		const response = await this.openai.beta.threads.messages.create(threadId, {
			content: message,
			role: "user",
		});
		console.log("Mensagem adicionada:", response);
		return response;
	}

	private async threadRun(threadId: string, assistantId: string) {
		return this.openai.beta.threads.runs.create(threadId, {
			assistant_id: assistantId,
		});
	}

	private async checkRunStatus(threadId: string, runId: string) {
		let status = "in_progress";
		while (["queued", "in_progress", "cancelling"].includes(status)) {
			const response = await this.openai.beta.threads.runs.retrieve(
				threadId,
				runId
			);
			status = response.status;
			console.log("Status atual:", status);
			if (status === "completed") {
				return response;
			}
			await new Promise((resolve) => setTimeout(resolve, 1000)); // Esperar 1 segundo
		}
	}

	// private async gptSendMessage(
	// 	message: string,
	// 	role: ChatGptRoles,
	// 	history: OpenAI.Chat.Completions.ChatCompletionMessageParam[]
	// ) {
	// 	history.push({
	// 		content: message,
	// 		role: role,
	// 	});
	// 	return this.openai.chat.completions.create({
	// 		model: this.chatgptModel,
	// 		messages: history,
	// 	});
	// }

	private async getAssistantResponse(threadId: string) {
		const response = await this.openai.beta.threads.messages.list(threadId);
		const messages = response.data;

		// Find the last assistant message
		const assistantMessage = messages
			.reverse()
			.find((msg) => msg.role === ChatGptRoles.Assistant);

		if (!assistantMessage) {
			throw new Error("No assistant response found in the thread.");
		}

		console.log("Assistant response:", assistantMessage.content[0]);
		return assistantMessage.content[0];
	}
}
