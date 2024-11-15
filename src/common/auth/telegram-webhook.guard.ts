export class TelegramWebhookGuard {
	static canActivate(context: { headers: any }) {
		const request = context.headers;
		const apiKey = request["X-Telegram-Bot-Api-Secret-Token"];

		if (apiKey !== process.env.API_KEY) {
			throw {
				statusCode: 401,
				message: "Unauthorized",
			};
		}

		return true;
	}
}
