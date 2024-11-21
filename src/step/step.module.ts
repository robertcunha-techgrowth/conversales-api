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
import {
	IntroStep,
	CollectData,
	CheckoutStep,
	ConfirmStep,
	ListProductsStep,
	SelectedProductStep,
} from "./step.service";
import { ProductModule } from "../product/product.module";

const StepModelProvider = new FactoryProvider({
	provide: "StepModel",
	useFactory: () => {
		return mongoose.model(Step.name, StepSchema);
	},
});

const NormalStepProvider = new ClassProvider({
	provide: IntroStep.name,
	useClass: IntroStep,
});

const ListProductsStepProvider = new ClassProvider({
	provide: ListProductsStep.name,
	useClass: ListProductsStep,
});

const SelectedProductStepProvider = new ClassProvider({
	provide: SelectedProductStep.name,
	useClass: SelectedProductStep,
});

const CollectedDataStepProvider = new ClassProvider({
	provide: CollectData.name,
	useClass: CollectData,
});

const CheckoutStepProvider = new ClassProvider({
	provide: CheckoutStep.name,
	useClass: CheckoutStep,
});

const ConfirmStepProvider = new ClassProvider({
	provide: ConfirmStep.name,
	useClass: ConfirmStep,
});

@ModuleHandler({
	imports: [ChatGptModule, TelegramModule, TicketModule, ProductModule],
	providers: [
		NormalStepProvider,
		ListProductsStepProvider,
		SelectedProductStepProvider,
		StepModelProvider,
		CollectedDataStepProvider,
		CheckoutStepProvider,
		ConfirmStepProvider,
	],
	exports: [
		NormalStepProvider,
		ListProductsStepProvider,
		SelectedProductStepProvider,
		StepModelProvider,
		CollectedDataStepProvider,
		CheckoutStepProvider,
		ConfirmStepProvider,
	],
})
export class StepModule {}
