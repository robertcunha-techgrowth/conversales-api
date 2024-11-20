import mongoose from "mongoose";
import { ModuleHandler } from "../common/dependency-injection/module";
import { Product, ProductSchema } from "./product.entity";
import {
	ClassProvider,
	FactoryProvider,
} from "../common/dependency-injection/provider";
import { ProductService } from "./product.service";
const ProductModelProvider = new FactoryProvider({
	provide: "ProductModel",
	useFactory: () => {
		return mongoose.model(Product.name, ProductSchema);
	},
});

const ProductServiceProvider = new ClassProvider({
	provide: "ProductService",
	useClass: ProductService,
});

@ModuleHandler({
	providers: [ProductModelProvider, ProductServiceProvider],
	exports: [ProductServiceProvider],
})
export class ProductModule {}
