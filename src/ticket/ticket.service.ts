import { Model } from "mongoose";
import { Inject } from "../common/dependency-injection/inject";
import { Injectable } from "../common/dependency-injection/injectable";
import { FindParamsDto } from "./ticker.handler";
import { Ticket } from "./ticket.entity";

@Injectable()
export class TicketService {
	constructor(
		@Inject("TicketModel") private readonly ticketModel: Model<Ticket>
	) {}

	async findAll(params: FindParamsDto) {
		const { filter, options, pagination } = params;
		const { page, limit } = pagination ?? { page: 1, limit: 0 };

		const tickets = await this.ticketModel
			.find(filter, null, options)
			.skip((page - 1) * limit)
			.limit(limit)
			.lean();

		return tickets;
	}
}
