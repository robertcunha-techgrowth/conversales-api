export class XApiKeyGuard {
	static canActivate(context: { headers: any }) {
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
