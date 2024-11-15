import mongoose from "mongoose";
import { ModuleHandler } from "../common/dependency-injection/module";
import {
	ClassProvider,
	FactoryProvider,
} from "../common/dependency-injection/provider";
import { Step, StepSchema } from "./step.entity";
import { ChatGptModule } from "../chatbot/chatgpt/chatgpt.module";
import { TelegramModule } from "../channel/telegram/telegram.module";
import { TicketModule } from "../ticket/ticket.module";
import { NormalStep } from "./step.service";

const StepModelProvider = new FactoryProvider({
	provide: "StepModel",
	useFactory: () => {
		return mongoose.model(Step.name, StepSchema);
	},
});

const PromptProvider = new FactoryProvider({
	provide: "Prompt",
	useFactory: () => {
		return process.env.PROMPT;
	},
});

const StepServiceProvider = new ClassProvider({
	provide: "StepService",
	useClass: NormalStep,
});

@ModuleHandler({
	imports: [ChatGptModule, TelegramModule, TicketModule],
	providers: [StepModelProvider, PromptProvider, StepServiceProvider],
	exports: [StepServiceProvider],
})
export class StepModule {}
