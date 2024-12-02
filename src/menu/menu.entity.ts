import { Prop } from "../common/database/prop.decorator";
import { Schema } from "../common/database/schema.decorator";
import { SchemaFactory } from "../common/database/schema.factory";

@Schema({
	_id: false,
})
export class MenuItem {
	// número do menu
	@Prop({
		type: String,
	})
	key: string;

	// step real que deve ser direcionado
	@Prop({
		type: Number,
		required: true,
	})
	stepNumber: number;

	@Prop({
		type: String,
		required: true,
	})
	text: string;
}

const MenuItemSchema = SchemaFactory.createFromClass(MenuItem);

@Schema({
	_id: false,
})
export class Menu {
	@Prop({
		type: [MenuItemSchema],
	})
	items: MenuItem[];
}

export const MenuSchema = SchemaFactory.createFromClass(Menu);
