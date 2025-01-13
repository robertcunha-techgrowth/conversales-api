import mongoose from "mongoose";
import { ModuleHandler } from "../common/dependency-injection/module";
import {
	ClassProvider,
	FactoryProvider,
} from "../common/dependency-injection/provider";
import { Ticket, TicketSchema } from "./ticket.entity";

const TicketModelProvider = new FactoryProvider({
	provide: "TicketModel",
	useFactory: () => {
		return mongoose.model(Ticket.name, TicketSchema);
	},
});

@ModuleHandler({
	providers: [TicketModelProvider],
	exports: [TicketModelProvider],
})
export class TicketModule {}
