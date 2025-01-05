import mongoose from "mongoose";
import { ModuleHandler } from "../common/dependency-injection/module";
import { FactoryProvider } from "../common/dependency-injection/provider";
import { ContactMessage, ContactMessageSchema } from "./contact-message.entity";

export const ContactMessageModelProvider = new FactoryProvider({
	useFactory: () => {
		return mongoose.model(ContactMessage.name, ContactMessageSchema);
	},
	provide: "ContactMessageModel",
});

@ModuleHandler({
	providers: [ContactMessageModelProvider],
	exports: [ContactMessageModelProvider],
})
export class ContactMessageModule {}
