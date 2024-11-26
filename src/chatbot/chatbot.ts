import { StepKind } from "../step/step.entity";

export interface InputStepParams {}

export interface OutputTaskInterpretation {
	step: StepKind;
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
	getMessage(
		inputParams: InputStepParams,
		step: string
	): Promise<GetMessageResponse>;

	interpretateMessage(message: string): Promise<InterpretateMessageResponse>;
}
