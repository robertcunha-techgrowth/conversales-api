import { IsEmail, IsString } from "class-validator";

export class CreateCompanyDto {
	@IsString()
	name: string;

	@IsString()
	nationalId: string;

	@IsEmail()
	email: string;

	@IsString()
	activationCode: string;
}
