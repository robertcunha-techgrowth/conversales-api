import { FilterQuery, Model, QueryOptions } from "mongoose";
import { Product } from "./product.entity";
import { Inject } from "../common/dependency-injection/inject";
import { Injectable } from "../common/dependency-injection/injectable";

export class Pagination {
	page: number;
	limit: number;
}

export interface FindItem {
	filter?: FilterQuery<Product>;
	options?: QueryOptions<Product>;
}

export interface FindItems extends FindItem {
	pagination?: Pagination;
}

@Injectable()
export class ProductService {
	constructor(
		@Inject("ProductModel") private readonly productModel: Model<Product>
	) {}

	async create(data: Product) {
		const product = await this.productModel.create(data);
		return product.toObject();
	}

	async findAll(params?: FindItems): Promise<Product[]> {
		const { filter, options, pagination } = params ?? {};

		const { page, limit } = pagination ?? { page: 1, limit: 10 };

		return this.productModel
			.find(filter ?? {}, null, options)
			.skip((page - 1) * limit)
			.limit(limit)
			.lean();
	}

	async findOne(params?: FindItem) {
		const { filter, options } = params ?? {};

		return this.productModel.findOne(filter ?? {}, null, options).lean();
	}
}
