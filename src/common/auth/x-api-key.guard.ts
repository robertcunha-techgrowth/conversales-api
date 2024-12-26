import { ClassOrMethodDecorator } from "../dependency-injection/class-or-method-decorator";
import { AuthGuard } from "./auth.guard";

export class XApiKey implements AuthGuard {
	canActivate(context: { headers: any }): boolean {
		const request = context.headers;
		const apiKey = request?.["x-api-key"];

		if (apiKey !== process.env.API_KEY) {
			throw {
				statusCode: 401,
				message: "Unauthorized",
			};
		}

		return true;
	}
}

export function XApiKeyGuard(): ClassOrMethodDecorator {
	return (
		target: any,
		propertyKey?: string | symbol,
		descriptor?: PropertyDescriptor
	) => {
		if (propertyKey && descriptor) {
			// Method decorator case
			const originalMethod = descriptor.value;
			descriptor.value = function (...args: any[]) {
				const telegramWebhookGuard = new XApiKey();
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
						const telegramWebhookGuard = new XApiKey();
						telegramWebhookGuard.canActivate(args[0]);
						const result = originalMethod.apply(this, args);
						return result;
					};
				}
			}
		}
	};
}
