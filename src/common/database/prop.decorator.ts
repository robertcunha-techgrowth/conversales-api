import "reflect-metadata";

export interface SchemaProp {
	type: any;
	required?: boolean;
	unique?: boolean;
	default?: Function;
}

export const Prop = (prop: SchemaProp): PropertyDecorator => {
	return (target: Object, propertyKey: string | symbol) => {
		Reflect.defineMetadata(
			`${target.constructor.name}:${propertyKey.toString()}`,
			{
				[propertyKey]: prop,
			},
			target
		);
	};
};
