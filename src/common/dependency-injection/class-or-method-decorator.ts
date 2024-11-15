export type ClassOrMethodDecorator = <T>(
	target: T | Object,
	propertyKey?: string | symbol,
	descriptor?: TypedPropertyDescriptor<any>
) => void;
