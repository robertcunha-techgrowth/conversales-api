import mongoose from "mongoose";
import "reflect-metadata";

export class MongooseModule {
	static async forRoot(uri: string) {
		await mongoose.connect(uri);
		console.log("Connected to MongoDB");
	}

	static async finish() {
		await mongoose.connection.close();
	}
}
