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

// const TicketServiceProvider = new ClassProvider({
// 	provide: TicketService.name,
// 	useClass: TicketService,
// });

// const TicketHandlerProvider = new ClassProvider({
// 	provide: TicketHandler.name,
// 	useClass: TicketHandler,
// });

@ModuleHandler({
	providers: [TicketModelProvider],
	exports: [TicketModelProvider],
})
export class TicketModule {}
