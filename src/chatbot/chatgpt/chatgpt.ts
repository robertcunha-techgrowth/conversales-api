import OpenAI from "openai";
import { Injectable } from "../../common/dependency-injection/injectable";
import { Inject } from "../../common/dependency-injection/inject";
import { ChatBot } from "../chatbot";
import { Ticket } from "../../ticket/ticket.entity";
import { Model } from "mongoose";

export enum ChatGptRoles {
	User = "user",
	Assistant = "assistant",
	System = "system",
}

@Injectable()
export class ChatGpt implements ChatBot {
	constructor(
		@Inject("OpenAI") private readonly openai: OpenAI,
		@Inject("AssistantId") private readonly assistantId: string,
		@Inject("TicketModel") private readonly ticketModel: Model<Ticket>
	) {}

	async getAIResponseText(
		rule: string,
		params: Record<string, any>,
		ticket: Ticket
	): Promise<string> {
		const response = await this.sendMessage(
			JSON.stringify({
				rule,
				params,
			}),
			ticket
		);
		const data = (response as any).text.value;
		return data;
	}

	async sendMessage(message: string, ticket: Ticket): Promise<string> {
		if (!ticket.threadId) {
			const thread = await this.createThread();
			const threadId = thread.id;
			ticket.threadId = threadId;
		}
		const { threadId } = ticket;
		ticket.history.push({
			role: ChatGptRoles.User,
			content: message,
		});
		const response = await this.sendMessageToThread(threadId, message);
		ticket.history.push({
			role: ChatGptRoles.Assistant,
			content: response.text.value,
		});
		await this.ticketModel.findOneAndUpdate(
			{
				_id: ticket._id,
			},
			{
				threadId: threadId,
				history: ticket.history,
			}
		);
		return response;
	}

	private async sendMessageToThread(threadId: string, message: string) {
		await this.addMessageToThread(threadId, message);
		console.log(`Thread ID: ${threadId}\nMensagem: ${message}`);
		const run = await this.threadRun(threadId, this.assistantId);
		await this.checkRunStatus(threadId, run.id);
		const assistantMessage = await this.getAssistantResponse(threadId);
		// toDo: the return of this shit is fucking wrong
		// should fix this shit
		console.log(assistantMessage);
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

	private async getAssistantResponse(threadId: string) {
		const response = await this.openai.beta.threads.messages.list(threadId);
		const messages = response.data;

		console.log(messages);

		// Find the last assistant message
		const assistantMessage = messages
			// .reverse()
			.find((msg) => msg.role === ChatGptRoles.Assistant);

		// console.log(messages);

		if (!assistantMessage) {
			throw new Error("No assistant response found in the thread.");
		}

		console.log("Assistant response:", assistantMessage.content[0]);
		return assistantMessage.content[0];
	}
}
