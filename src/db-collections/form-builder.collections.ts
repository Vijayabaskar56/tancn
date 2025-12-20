import {
	createCollection,
	localStorageCollectionOptions,
} from "@tanstack/react-db";
import { z } from "zod";

export const FormBuilderSettingsSchema = z.object({
	defaultRequiredValidation: z.boolean().default(true),
	numericInput: z.boolean().default(false),
	focusOnError: z.boolean().default(true),
	validationMethod: z
		.enum(["onChange", "onBlur", "onDynamic"])
		.default("onDynamic"),
	asyncValidation: z.number().min(0).max(10000).default(500),
	activeTab: z
		.enum(["builder", "template", "settings", "generate"])
		.default("builder"),
	preferredSchema: z.enum(["zod", "valibot", "arktype"]).default("zod"),
	preferredFramework: z.enum(["react", "vue", "angular", "solid"]).default("react"),
	preferredPackageManager: z.enum(["pnpm", "npm", "yarn", "bun"]).default("pnpm"),
	isCodeSidebarOpen: z.boolean().default(false),
});

// ============================================================================
// Form Elements Schema
// ============================================================================

const OptionSchema = z.object({
	value: z.string(),
	label: z.string(),
});

// Common HTML attributes that might be stored
const CommonHtmlProps = z.object({
	placeholder: z.string().optional(),
	disabled: z.boolean().optional(),
	className: z.string().optional(),
	defaultValue: z.union([z.string(), z.number(), z.boolean()]).optional(),
});

const SharedFormPropsSchema = CommonHtmlProps.extend({
	id: z.string(),
	name: z.string(),
	label: z.string().optional(),
	description: z.string().optional(),
	required: z.boolean().optional(),
	static: z.boolean().optional(),
});

// Field Types
const InputSchema = SharedFormPropsSchema.extend({
	fieldType: z.literal("Input"),
	type: z.string().optional(), // HTML input type
});

const PasswordInputSchema = SharedFormPropsSchema.extend({
	fieldType: z.literal("Password"),
	type: z.literal("password"),
});

const OTPInputSchema = SharedFormPropsSchema.extend({
	fieldType: z.literal("OTP"),
	children: z.any().optional(), // ReactNode is hard to validate, allowing any for children if stored
});

const TextareaSchema = SharedFormPropsSchema.extend({
	fieldType: z.literal("Textarea"),
});

const CheckboxSchema = SharedFormPropsSchema.extend({
	fieldType: z.literal("Checkbox"),
	checked: z.boolean().optional(),
});

const RadioGroupSchema = SharedFormPropsSchema.extend({
	fieldType: z.literal("RadioGroup"),
	options: z.array(OptionSchema),
});

const ToggleGroupSchema = SharedFormPropsSchema.extend({
	fieldType: z.literal("ToggleGroup"),
	options: z.array(OptionSchema),
	type: z.union([z.literal("single"), z.literal("multiple")]),
});

const SwitchSchema = SharedFormPropsSchema.extend({
	fieldType: z.literal("Switch"),
	checked: z.boolean().optional(),
});

const SliderSchema = SharedFormPropsSchema.extend({
	fieldType: z.literal("Slider"),
	min: z.number().optional(),
	max: z.number().optional(),
	step: z.number().optional(),
	value: z.array(z.number()).optional(),
});

const SelectSchema = SharedFormPropsSchema.extend({
	fieldType: z.literal("Select"),
	options: z.array(OptionSchema),
	placeholder: z.string(),
});

const MultiSelectSchema = SharedFormPropsSchema.extend({
	fieldType: z.literal("MultiSelect"),
	options: z.array(OptionSchema),
	placeholder: z.string(),
});

const DatePickerSchema = SharedFormPropsSchema.extend({
	fieldType: z.literal("DatePicker"),
});

// Static Elements
const StaticBaseSchema = z.object({
	id: z.string(),
	name: z.string(),
	static: z.literal(true),
	content: z.string().optional(),
});

const H1Schema = StaticBaseSchema.extend({
	fieldType: z.literal("H1"),
	content: z.string(),
});

const H2Schema = StaticBaseSchema.extend({
	fieldType: z.literal("H2"),
	content: z.string(),
});

const H3Schema = StaticBaseSchema.extend({
	fieldType: z.literal("H3"),
	content: z.string(),
});

const DividerSchema = StaticBaseSchema.extend({
	fieldType: z.literal("Separator"),
});

const DescriptionSchema = StaticBaseSchema.extend({
	fieldType: z.literal("FieldDescription"),
	content: z.string(),
});

const LegendSchema = StaticBaseSchema.extend({
	fieldType: z.literal("FieldLegend"),
	content: z.string(),
});

// Recursive Structures
// We need to define types for recursion
export type FormElement =
	| z.infer<typeof InputSchema>
	| z.infer<typeof PasswordInputSchema>
	| z.infer<typeof OTPInputSchema>
	| z.infer<typeof TextareaSchema>
	| z.infer<typeof CheckboxSchema>
	| z.infer<typeof RadioGroupSchema>
	| z.infer<typeof ToggleGroupSchema>
	| z.infer<typeof SwitchSchema>
	| z.infer<typeof SliderSchema>
	| z.infer<typeof SelectSchema>
	| z.infer<typeof MultiSelectSchema>
	| z.infer<typeof DatePickerSchema>
	| z.infer<typeof H1Schema>
	| z.infer<typeof H2Schema>
	| z.infer<typeof H3Schema>
	| z.infer<typeof DividerSchema>
	| z.infer<typeof DescriptionSchema>
	| z.infer<typeof LegendSchema>
	| FormArray;

export type FormElementOrList = FormElement | FormElement[];
export type FormElementList = FormElementOrList[];

export interface FormArrayEntry {
	id: string;
	fields: FormElementList;
}

export interface FormArray {
	fieldType: "FormArray";
	id: string;
	name: string;
	label?: string;
	arrayField: FormElementList;
	entries: FormArrayEntry[];
}

const FormElementSchema: z.ZodType<FormElement> = z.lazy(() =>
	z.union([
		InputSchema,
		PasswordInputSchema,
		OTPInputSchema,
		TextareaSchema,
		CheckboxSchema,
		RadioGroupSchema,
		ToggleGroupSchema,
		SwitchSchema,
		SliderSchema,
		SelectSchema,
		MultiSelectSchema,
		DatePickerSchema,
		H1Schema,
		H2Schema,
		H3Schema,
		DividerSchema,
		DescriptionSchema,
		LegendSchema,
		FormArraySchema,
	]),
);

const FormElementOrListSchema: z.ZodType<FormElementOrList> = z.lazy(() =>
	z.union([FormElementSchema, z.array(FormElementSchema)]),
);

const FormElementListSchema: z.ZodType<FormElementList> = z.array(
	FormElementOrListSchema,
);

const FormArrayEntrySchema: z.ZodType<FormArrayEntry> = z.object({
	id: z.string(),
	fields: FormElementListSchema,
});

const FormArraySchema: z.ZodType<FormArray> = z.lazy(() =>
	z.object({
		fieldType: z.literal("FormArray"),
		id: z.string(),
		name: z.string(),
		label: z.string().optional(),
		arrayField: FormElementListSchema,
		entries: z.array(FormArrayEntrySchema),
	}),
);

export const FormStepSchema = z.object({
	id: z.string(),
	stepFields: FormElementListSchema,
});

// ============================================================================
// Unified Form Builder Schema
// ============================================================================
// The top-level formElements can be a list of elements (single or row) OR a list of steps

// The top-level formElements can be a list of elements (single or row) OR a list of steps
const FormElementsSchema = z.union([
	FormElementListSchema,
	z.array(FormStepSchema),
	z.array(FormArraySchema), // Less likely at top level but possible by type def
]);

export const FormBuilderSchema = z.object({
	id: z.number(),
	formName: z.string().default("draft"),
	schemaName: z.string().default("draftFormSchema"),
	isMS: z.boolean().default(false),
	formElements: FormElementsSchema.default([]),
	settings: FormBuilderSettingsSchema.default({
		defaultRequiredValidation: true,
		numericInput: false,
		focusOnError: true,
		validationMethod: "onDynamic",
		asyncValidation: 500,
		activeTab: "builder",
		preferredSchema: "zod",
		preferredFramework: "react",
		preferredPackageManager: "pnpm",
		isCodeSidebarOpen: false,
	}),
	lastAddedStepIndex: z.number().optional(),
});

// ============================================================================
// Type Exports
// ============================================================================

export type FormBuilder = z.infer<typeof FormBuilderSchema>;
export type FormBuilderSettings = z.infer<typeof FormBuilderSettingsSchema>;

export type FormStep = z.infer<typeof FormStepSchema>;
export type FormElements = z.infer<typeof FormElementsSchema>;

export type ValidationMethod = FormBuilderSettings["validationMethod"];
export type PreferredSchema = FormBuilderSettings["preferredSchema"];
export type PreferredFramework = FormBuilderSettings["preferredFramework"];
export type PreferredPackageManager =
	FormBuilderSettings["preferredPackageManager"];
export type ActiveTab = FormBuilderSettings["activeTab"];
export type Option = z.infer<typeof OptionSchema>;
// ============================================================================
// Collection Setup
// ============================================================================

const formBuilderCollection = createCollection(
	localStorageCollectionOptions({
		storageKey: "form-builder",
		getKey: (formBuilder) => formBuilder.id,
		schema: FormBuilderSchema,
	}),
);

// ============================================================================
// Saved Form Templates Schema
// ============================================================================

export const SavedFormTemplateSchema = z.object({
	id: z.string(),
	name: z.string(),
	data: FormBuilderSchema,
	createdAt: z.string(),
});

export type SavedFormTemplate = z.infer<typeof SavedFormTemplateSchema>;

export { formBuilderCollection };
