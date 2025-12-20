import {
	Brackets,
	Calendar,
	CheckSquare,
	ChevronDown,
	CircleDot,
	Grid3X3,
	Hash,
	Heading1,
	Heading2,
	Heading3,
	ListChecks,
	Lock,
	Minus,
	Shield,
	Sliders,
	ToggleLeft,
	Type,
	WrapText,
} from "lucide-react";

/**
 * used in
 * - form-elements-selector.tsx
 * - form-elements-selector-command.tsx
 */
export const formElementsList = [
	{
		group: "field",
		name: "Checkbox",
		fieldType: "Checkbox",
		icon: CheckSquare,
	},
	{
		group: "field",
		name: "Date Picker",
		fieldType: "DatePicker",
		icon: Calendar,
	},
	{
		group: "display",
		name: "Heading 1",
		fieldType: "H1",
		content: "Heading 1",
		icon: Heading1,
		static: true,
	},
	{
		group: "display",
		name: "Heading 2",
		fieldType: "H2",
		content: "Heading 2",
		icon: Heading2,
		static: true,
	},
	{
		group: "display",
		name: "Heading 3",
		fieldType: "H3",
		content: "Heading 3",
		icon: Heading3,
		static: true,
	},

	{
		group: "display",
		name: "Description",
		fieldType: "FieldDescription",
		content: "Lorem ipsum dolor sit amet, consectetur adipisicing elit.",
		icon: Type,
		static: true,
	},
	{
		group: "display",
		name: "Legend",
		fieldType: "FieldLegend",
		content: "Lorem ipsum dolor sit amet, consectetur adipisicing elit.",
		icon: Type,
		static: true,
	},
	{
		group: "field",
		name: "Input",
		fieldType: "Input",
		icon: Type,
	},
	{
		group: "field",
		name: "Input OTP",
		fieldType: "OTP",
		icon: Shield,
	},
	// {
	// 	group: "field",
	// 	name: "Multi select",
	// 	fieldType: "MultiSelect",
	// 	icon: ListChecks,
	// 	options: [
	// 		{
	// 			value: "1",
	// 			label: "Option 1",
	// 		},
	// 		{
	// 			value: "2",
	// 			label: "Option 2",
	// 		},
	// 		{
	// 			value: "3",
	// 			label: "Option 3",
	// 		},
	// 		{
	// 			value: "4",
	// 			label: "Option 4",
	// 		},
	// 		{
	// 			value: "5",
	// 			label: "Option 5",
	// 		},
	// 	],
	// },
	{
		group: "field",
		name: "Password",
		fieldType: "Password",
		type: "password",
		icon: Lock,
	},
	{
		group: "field",
		name: "Radio",
		icon: CircleDot,
		fieldType: "RadioGroup",
		options: [
			{
				value: "1",
				label: "Option 1",
			},
			{
				value: "2",
				label: "Option 2",
			},
			{
				value: "2",
				label: "Option 3",
			},
		],
	},
	{
		group: "field",
		name: "Select",
		icon: ChevronDown,
		fieldType: "Select",
		options: [
			{
				value: "1",
				label: "Option 1",
			},
			{
				value: "2",
				label: "Option 2",
			},
		],
	},
	{
		group: "display",
		name: "Separator",
		fieldType: "Separator",
		static: true,
		icon: Minus,
	},
	{
		group: "field",
		name: "Slider",
		fieldType: "Slider",
		icon: Sliders,
		min: 1,
		max: 100,
		step: 2,
	},
	{
		group: "field",
		name: "Switch",
		fieldType: "Switch",
		icon: ToggleLeft,
	},
	{
		group: "field",
		name: "Textarea",
		fieldType: "Textarea",
		icon: WrapText,
	},
	{
		group: "field",
		name: "Toggle",
		fieldType: "ToggleGroup",
		icon: Grid3X3,
	},
];

/**
 * Table column types for adding columns
 */
export const tableColumnTypes = [
	{
		name: "String",
		type: "string",
		icon: Type,
	},
	{
		name: "Number",
		type: "number",
		icon: Hash,
	},
	{
		name: "Boolean",
		type: "boolean",
		icon: CheckSquare,
	},
	{
		name: "Date",
		type: "date",
		icon: Calendar,
	},
	{
		name: "Email",
		type: "email",
		icon: Type,
	},
	{
		name: "URL",
		type: "url",
		icon: Type,
	},
	{
		name: "Phone",
		type: "tel",
		icon: Type,
	},
	{
		name: "Time",
		type: "time",
		icon: Calendar,
	},
	{
		name: "DateTime",
		type: "datetime",
		icon: Calendar,
	},
	{
		name: "Object",
		type: "object",
		icon: Grid3X3,
	},
	{
		name: "Enum",
		type: "enum",
		icon: ListChecks,
	},
	{
		name: "Array",
		type: "array",
		icon: Brackets,
	},
];
