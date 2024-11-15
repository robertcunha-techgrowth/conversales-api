import { globalTarget } from "./global-target";

export const Controller = (): ClassDecorator => {
	return (target) => {
		const className = target.name;
		Reflect.defineMetadata(
			`${className}:controller:constructor`,
			target,
			globalTarget
		);
	};
};
