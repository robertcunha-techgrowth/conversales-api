import mongoose from "mongoose";
import { ModuleHandler } from "../common/dependency-injection/module";
import {
	ClassProvider,
	FactoryProvider,
} from "../common/dependency-injection/provider";
import { Step, StepSchema } from "./step.entity";
import { TicketModule } from "../ticket/ticket.module";
import { ProductModule } from "../product/product.module";
import { IntroStep } from "./introduction-step";
import { ListProductsStep } from "./list-product-step";
import { SetPropertyStep } from "./set-property-step";
import { AddProductStep } from "./add-product-step";
import { CheckoutStep } from "./checkout-step";
import { DetectStep } from "./detect-step";
import { FinishContactStep } from "./finish-contact.step";

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

const SetPropertyStepProvider = new ClassProvider({
	provide: SetPropertyStep.name,
	useClass: SetPropertyStep,
});

const AddProductStepProvider = new ClassProvider({
	provide: AddProductStep.name,
	useClass: AddProductStep,
});

const CheckoutStepProvider = new ClassProvider({
	provide: CheckoutStep.name,
	useClass: CheckoutStep,
});

const DetectStepProvider = new ClassProvider({
	provide: DetectStep.name,
	useClass: DetectStep,
});

const FinishContactProvider = new ClassProvider({
	provide: FinishContactStep.name,
	useClass: FinishContactStep,
});

@ModuleHandler({
	imports: [TicketModule, ProductModule],
	providers: [
		NormalStepProvider,
		ListProductsStepProvider,
		StepModelProvider,
		SetPropertyStepProvider,
		AddProductStepProvider,
		CheckoutStepProvider,
		FinishContactProvider,
		DetectStepProvider,
	],
	exports: [
		NormalStepProvider,
		ListProductsStepProvider,
		StepModelProvider,
		SetPropertyStepProvider,
		AddProductStepProvider,
		CheckoutStepProvider,
		FinishContactProvider,
		DetectStepProvider,
	],
})
export class StepModule {}
