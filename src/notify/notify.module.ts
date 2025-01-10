import axios from "axios";
import { ModuleHandler } from "../common/dependency-injection/module";
import {
	ClassProvider,
	FactoryProvider,
} from "../common/dependency-injection/provider";
import { NotifyWhatsapp } from "./notify";

const NotifyAxiosInstanceProvider = new FactoryProvider({
	provide: "NotifyAxiosInstance",
	useFactory: () => {
		return axios.create({
			baseURL: process.env.NOTIFY_API,
		});
	},
});

const NotifyWhatsappProvider = new ClassProvider({
	provide: NotifyWhatsapp.name,
	useClass: NotifyWhatsapp,
});

@ModuleHandler({
	imports: [],
	providers: [NotifyAxiosInstanceProvider, NotifyWhatsappProvider],
	exports: [NotifyWhatsappProvider],
})
export class NotifyModule {}
