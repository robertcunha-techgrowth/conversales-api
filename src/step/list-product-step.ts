import { Model } from "mongoose";
import { InputStepParams, OutputTaskInterpretation } from "../chatbot/chatbot";
import { Inject } from "../common/dependency-injection/inject";
import { Injectable } from "../common/dependency-injection/injectable";
import { Product } from "../product/product.entity";
import { ProductService } from "../product/product.service";
import { Ticket } from "../ticket/ticket.entity";
import { Step, StepKind } from "./step.entity";
import { StepService } from "./step.service";

export interface InputParamsListProducts extends InputStepParams {
	products: Product[];
}

@Injectable()
export class ListProductsStep extends StepService {
	constructor(
		@Inject(ProductService.name)
		private readonly productService: ProductService,
		@Inject("TicketModel") ticketModel: Model<Ticket>,
		@Inject("StepModel") private readonly stepModel: Model<Step>
	) {
		super(stepModel, ticketModel);
	}

	async run(ticket: Ticket, _text: string): Promise<OutputTaskInterpretation> {
		const step = await this.model
			.findOne({
				stepNumber: ticket.currentStep,
			})
			.lean();
		const products = await this.productService.findAll();
		await this.ticketModel.findOneAndUpdate(
			{
				_id: ticket._id,
			},
			{
				products,
				currentStep: step.chainedStep,
			}
		);
		return {
			rule: step.rule,
			params: {
				menu: products.reduce<
					Record<number, { name: string; price: number; description: string }>
				>((prev, product) => {
					prev[product.num] = {
						name: product.name,
						price: product.price,
						description: product.description,
					};
					return prev;
				}, {}),
			},
		};
	}
}
