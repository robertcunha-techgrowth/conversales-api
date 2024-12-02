import "reflect-metadata";
import { globalTarget } from "../dependency-injection/global-target";
import { SchemaDefinitionProperty } from "mongoose";

export interface SchemaProp {
	type: any;
	required?: boolean;
	unique?: boolean;
	default?: Function;
	ref?: string;
}

export const Prop = (prop: SchemaDefinitionProperty): PropertyDecorator => {
	return (target: Object, propertyKey: string | symbol) => {
		Reflect.defineMetadata(
			`${target.constructor.name}:${propertyKey.toString()}`,
			{
				[propertyKey]: prop,
			},
			globalTarget
		);
	};
};
