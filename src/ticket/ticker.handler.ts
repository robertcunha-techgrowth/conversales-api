import { FilterQuery, QueryOptions } from "mongoose";
import { Controller } from "../common/dependency-injection/controller.decorator";
import { Inject } from "../common/dependency-injection/inject";
import { TicketService } from "./ticket.service";
import { Ticket } from "./ticket.entity";
import { IsNumber, IsOptional, Min } from "class-validator";
import { XApiKeyGuard } from "../common/auth/x-api-key.guard";

export class PaginationDto {
	@IsNumber()
	@Min(1)
	page: number;

	@Min(1)
	@IsNumber()
	limit: number;
}

export class FindParamsDto {
	@IsOptional()
	filter?: FilterQuery<Ticket>;

	@IsOptional()
	options?: QueryOptions<Ticket>;

	@IsOptional()
	pagination?: PaginationDto;
}

@XApiKeyGuard()
@Controller()
export class TicketHandler {
	constructor(
		@Inject(TicketService.name) private readonly ticketService: TicketService
	) {}

	async findAll(params: FindParamsDto) {
		return this.ticketService.findAll(params);
	}
}
