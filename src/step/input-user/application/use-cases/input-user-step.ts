import { StepService } from "../../../step.service";

export abstract class InputUserStep extends StepService {
	protected abstract validateInput(text: string): string;
}
