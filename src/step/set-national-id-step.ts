import { SetPropertyStep } from "./set-property-step";

export abstract class SetNationalIdStep extends SetPropertyStep {
	protected abstract validateNationalId(data: string): Promise<string>;

	protected override async runValidation(data: string): Promise<string> {
		const validatedNationalId = await this.validateNationalId(data);
		return validatedNationalId.toString();
	}
}
