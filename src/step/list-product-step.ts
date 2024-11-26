import { Model } from "mongoose";
import { InputStepParams, OutputTaskInterpretation } from "../chatbot/chatbot";
import { Inject } from "../common/dependency-injection/inject";
import { Injectable } from "../common/dependency-injection/injectable";
import { Product } from "../product/product.entity";
import { ProductService } from "../product/product.service";
import { Ticket } from "../ticket/ticket.entity";
import { StepKind } from "./step.entity";
import { StepService } from "./step.service";

export interface InputParamsListProducts extends InputStepParams {
	products: Product[];
}

@Injectable()
export class ListProductsStep extends StepService {
	constructor(
		@Inject(ProductService.name)
		private readonly productService: ProductService,
		@Inject("TicketModel") ticketModel: Model<Ticket>
	) {
		super(ticketModel);
	}

	async run(
		ticket: Ticket,
		_params?: InputParamsListProducts
	): Promise<OutputTaskInterpretation> {
		const products = await this.productService.findAll();
		await this.ticketModel.findOneAndUpdate(
			{
				_id: ticket._id,
			},
			{
				products,
			}
		);
		return {
			step: StepKind.LIST_PRODUCTS,
			params: {
				products: products.map((product) => {
					return {
						num: product.num,
						name: product.name,
						price: product.price,
						description: product.description,
					};
				}),
			},
		};
	}
}
