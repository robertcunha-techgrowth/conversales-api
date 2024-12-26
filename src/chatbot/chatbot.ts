import { Ticket } from "../ticket/ticket.entity";

export interface InputStepParams {}

export interface OutputTaskInterpretation {
	rule: string;
	params?: InputStepParams;
}

export interface UserMessageParams {}
export interface InterpretateMessageResponse {
	step: string;
	params?: UserMessageParams;
}

export interface GetMessageResponse {
	message: string;
}

export interface ChatBotHistory {
	role: string;
	content: string;
}

export interface ChatBot {
	getMessageTemplate(
		rule: string,
		params: Record<string, any>,
		ticket: Ticket
	): Promise<string>;
}
