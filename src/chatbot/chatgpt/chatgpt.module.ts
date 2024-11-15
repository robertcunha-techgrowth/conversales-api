import OpenAI from "openai";
import { ModuleHandler } from "../../common/dependency-injection/module";
import {
	ClassProvider,
	FactoryProvider,
} from "../../common/dependency-injection/provider";
import { ChatGpt } from "./chatgpt";

export const ChatGptModelProvider = new FactoryProvider({
	provide: "ChatGptModel",
	useFactory: () => {
		// toDo: return model using ssm
		return process.env.GPT_MODEL;
	},
});

export const OpenAIProvider = new FactoryProvider({
	provide: "OpenAI",
	useFactory: () => {
		const openAIApiKey = process.env.OPENAI_API_KEY;
		return new OpenAI({
			apiKey: openAIApiKey,
		});
	},
});

export const ChatGptProvider = new ClassProvider({
	provide: "Chatbot",
	useClass: ChatGpt,
});

@ModuleHandler({
	providers: [ChatGptModelProvider, OpenAIProvider, ChatGptProvider],
	exports: [ChatGptProvider],
})
export class ChatGptModule {}
