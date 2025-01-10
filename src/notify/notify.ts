import { AxiosInstance } from "axios";
import { Inject } from "../common/dependency-injection/inject";
import { Injectable } from "../common/dependency-injection/injectable";

export abstract class Notify {
	constructor(protected readonly notifyAxiosInstance: AxiosInstance) {}

	abstract notify(to: string, message: string): Promise<boolean>;
}

@Injectable()
export class NotifyWhatsapp extends Notify {
	constructor(
		@Inject("NotifyAxiosInstance") notifyAxiosInstance: AxiosInstance
	) {
		super(notifyAxiosInstance);
	}

	async notify(to: string, message: string): Promise<boolean> {
		const response = await this.notifyAxiosInstance.post("/send", {
			number: to,
			message,
		});

		return response.status === 200;
	}
}
