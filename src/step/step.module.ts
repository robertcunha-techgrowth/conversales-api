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
import { DetectStep } from "./input-user/detect-step";
import { FinishContactStep } from "./finish-contact.step";
import { PaymentStep } from "./payment/domain/payment-step";
import { PaymentModule } from "../payment/infrastructure/payment.module";
import { ContactInfoStep } from "./contact-info-step";
import { CompanyModule } from "../company/company.module";
import { WaitPaymentStep } from "./payment/domain/wait-payment.step";
import { RateServiceStep } from "./input-user/rate-service-step";
import { SetNameStep } from "./set-name-step";
import { SetCnpjStep } from "./set-cnpj-step";
import { SetEmailStep } from "./set-email-step";
import { SetCellphoneStep } from "./set-cellphone-step";
import { AskForDataStep } from "./ask-for-data-step";

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

const SetNameStepProvider = new ClassProvider({
	provide: SetNameStep.name,
	useClass: SetNameStep,
});

const SetCnpjStepProvider = new ClassProvider({
	provide: SetCnpjStep.name,
	useClass: SetCnpjStep,
});

const SetEmailStepProvider = new ClassProvider({
	provide: SetEmailStep.name,
	useClass: SetEmailStep,
});

const SetCellphoneStepProvider = new ClassProvider({
	provide: SetCellphoneStep.name,
	useClass: SetCellphoneStep,
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

const PaymentStepProvider = new ClassProvider({
	provide: PaymentStep.name,
	useClass: PaymentStep,
});

const ContactInfoStepProvider = new ClassProvider({
	provide: ContactInfoStep.name,
	useClass: ContactInfoStep,
});

const WaitPaymentStepProvider = new ClassProvider({
	provide: WaitPaymentStep.name,
	useClass: WaitPaymentStep,
});

const RateServiceStepProvider = new ClassProvider({
	provide: RateServiceStep.name,
	useClass: RateServiceStep,
});

const FinishContactProvider = new ClassProvider({
	provide: FinishContactStep.name,
	useClass: FinishContactStep,
});

const AskForDataStepPrvider = new ClassProvider({
	provide: AskForDataStep.name,
	useClass: AskForDataStep,
});

@ModuleHandler({
	imports: [TicketModule, ProductModule, PaymentModule, CompanyModule],
	providers: [
		NormalStepProvider,
		ListProductsStepProvider,
		StepModelProvider,
		AddProductStepProvider,
		CheckoutStepProvider,
		FinishContactProvider,
		PaymentStepProvider,
		ContactInfoStepProvider,
		WaitPaymentStepProvider,
		RateServiceStepProvider,
		SetNameStepProvider,
		SetCnpjStepProvider,
		SetEmailStepProvider,
		AskForDataStepPrvider,
		SetCellphoneStepProvider,
		DetectStepProvider,
	],
	exports: [
		NormalStepProvider,
		ListProductsStepProvider,
		StepModelProvider,
		AddProductStepProvider,
		CheckoutStepProvider,
		FinishContactProvider,
		PaymentStepProvider,
		ContactInfoStepProvider,
		WaitPaymentStepProvider,
		RateServiceStepProvider,
		SetNameStepProvider,
		SetCnpjStepProvider,
		SetEmailStepProvider,
		AskForDataStepPrvider,
		SetCellphoneStepProvider,
		DetectStepProvider,
	],
})
export class StepModule {}
