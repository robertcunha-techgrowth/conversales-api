import { ClassOrMethodDecorator } from "../dependency-injection/class-or-method-decorator";
import { AuthGuard } from "./auth.guard";

export class TelegramWebhookGuard implements AuthGuard {
	canActivate(context: { headers: any }) {
		const request = context.headers;
		const apiKey = request?.["x-telegram-bot-api-secret-token"];

		if (apiKey !== process.env.API_KEY) {
			console.log("Unauthorized");
			throw {
				statusCode: 401,
				status: 401,
				headers: { "Content-Type": "application/json" },
				body: {
					message: "Unauthorized",
					statusCode: 401,
					status: 401,
				},
			};
		}

		return true;
	}
}

export function TelegramApiGuard(): ClassOrMethodDecorator {
	return (
		target: any,
		propertyKey?: string | symbol,
		descriptor?: PropertyDescriptor
	) => {
		if (propertyKey && descriptor) {
			// Method decorator case
			const originalMethod = descriptor.value;
			descriptor.value = function (...args: any[]) {
				const telegramWebhookGuard = new TelegramWebhookGuard();
				telegramWebhookGuard.canActivate(args[0]);
				const result = originalMethod.apply(this, args);
				return result;
			};
		} else {
			// Class decorator case
			for (const key of Object.getOwnPropertyNames(target.prototype)) {
				const method = target.prototype[key];
				if (typeof method === "function" && key !== "constructor") {
					const originalMethod = method;
					target.prototype[key] = function (...args: any[]) {
						const telegramWebhookGuard = new TelegramWebhookGuard();
						telegramWebhookGuard.canActivate(args[0]);
						const result = originalMethod.apply(this, args);
						return result;
					};
				}
			}
		}
	};
}
