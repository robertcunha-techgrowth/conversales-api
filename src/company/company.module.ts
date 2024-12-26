import mongoose from "mongoose";
import { ModuleHandler } from "../common/dependency-injection/module";
import { FactoryProvider } from "../common/dependency-injection/provider";
import { Company, CompanySchema } from "./company.entity";

const CompanyModelProvider = new FactoryProvider({
	provide: "CompanyModel",
	useFactory: () => {
		return mongoose.model(Company.name, CompanySchema);
	},
});

@ModuleHandler({
	imports: [],
	providers: [CompanyModelProvider],
	exports: [CompanyModelProvider],
})
export class CompanyModule {}
