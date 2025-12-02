import { type ZodType, z } from "zod";
import { flattenFormSteps, getStepFields } from "@/lib/form-elements-helpers";
import { isStatic } from "@/utils/utils";
import type { FormArray, FormElement, FormStep } from "@/types/form-types";

// Type guard to check if an element is a FormArray
const isFormArray = (element: unknown): element is FormArray => {
	return (
		typeof element === "object" &&
		element !== null &&
		"arrayField" in element &&
		"fieldType" in element &&
		element.fieldType === "FormArray"
	);
};

// Type guard to check if an element is a FormElement
const isFormElement = (element: unknown): element is FormElement => {
	return (
		typeof element === "object" &&
		element !== null &&
		"fieldType" in element &&
		element.fieldType !== "FormArray"
	);
};

// Helper function to sanitize field names
const sanitizeFieldName = (name: string): string => name.replace(/-/g, "_");

// Type for field schema generators
type FieldSchemaGenerator = (element: FormElement) => ZodType;

// Type guards for specific field types
const hasTypeProperty = (
	element: FormElement,
): element is FormElement & { type: string } => {
	return "type" in element && typeof element.type === "string";
};

const hasMaxLengthProperty = (
	element: FormElement,
): element is FormElement & { maxLength?: number } => {
	return "maxLength" in element;
};

const hasMinMaxProperties = (
	element: FormElement,
): element is FormElement & { min?: number; max?: number } => {
	return "min" in element || "max" in element;
};

// Field type to schema generator mapping using Map
const FIELD_SCHEMA_MAP = new Map<
	FormElement["fieldType"],
	FieldSchemaGenerator
>([
	[
		"Input",
		(element) => {
			if (hasTypeProperty(element)) {
				if (element.type === "email") {
					return z.email();
				}
				if (element.type === "number") {
					return z.coerce.number();
				}
			}
			return z.string({ error: "This field is required" });
		},
	],
	[
		"Password",
		(element) => {
			if (hasTypeProperty(element)) {
				if (element.type === "email") {
					return z.email();
				}
				if (element.type === "number") {
					return z.coerce.number();
				}
			}
			return z.string({ error: "This field is required" });
		},
	],
	[
		"OTP",
		(element) => {
			const maxLength = hasMaxLengthProperty(element)
				? element.maxLength || 6
				: 6;
			return z
				.string({ error: "This field is required" })
				.min(maxLength, `OTP must be at least ${maxLength} characters`);
		},
	],
	["DatePicker", () => z.date()],
	["Checkbox", () => z.boolean({ error: "This field is required" })],
	[
		"Slider",
		(element) => {
			let schema = z.number();
			if (hasMinMaxProperties(element)) {
				if (element.min !== undefined) {
					schema = schema.min(element.min, `Must be at least ${element.min}`);
				}
				if (element.max !== undefined) {
					schema = schema.max(element.max, `Must be at most ${element.max}`);
				}
			}
			return schema;
		},
	],
	["Switch", () => z.boolean()],
	[
		"Select",
		() =>
			z
				.string({ error: "This field is required" })
				.min(1, "Please Select an item"),
	],
	[
		"ToggleGroup",
		(element) => {
			if (hasTypeProperty(element) && element.type === "single") {
				return z
					.string({ error: "This field is required" })
					.min(1, "Please select an item");
			}
			return z
				.array(z.string({ error: "This field is required" }))
				.nonempty("Please select at least one item");
		},
	],
	[
		"MultiSelect",
		() =>
			z
				.array(z.string({ error: "This field is required" }))
				.nonempty("Please select at least one item"),
	],
	[
		"RadioGroup",
		() =>
			z
				.string({ error: "Please select an item" })
				.min(1, "Please select an item"),
	],
	[
		"Textarea",
		() =>
			z
				.string({ error: "This field is required" })
				.nonempty("This field is required")
				.min(10, "Minimum Value Should be 10"),
	],
	// Static elements - should not reach here due to isStatic check
	["H1", () => z.string()],
	["H2", () => z.string()],
	["H3", () => z.string()],
	["Separator", () => z.string()],
]);

// Helper function to generate schema for a single field
const generateFieldSchema = (element: FormElement): ZodType => {
	const generator = FIELD_SCHEMA_MAP.get(element.fieldType);
	if (!generator) {
		return z.string();
	}

	let schema = generator(element);

	// Handle optional fields
	if (!("required" in element) || element.required !== true) {
		schema = schema.optional();
	}

	return schema;
};

// Helper function to process form elements recursively
const processFormElements = (
	elements: (FormElement | FormArray | FormElement[])[],
	schemaObject: Record<string, ZodType>,
): void => {
	for (const element of elements) {
		if (Array.isArray(element)) {
			processFormElements(element, schemaObject);
			continue;
		}

		if (isFormArray(element)) {
			// Use the template arrayField for schema generation
			const actualFields = element.arrayField;
			const arrayItemSchema = processArrayFields(actualFields);
			const arraySchema = z.array(z.object(arrayItemSchema));
			schemaObject[sanitizeFieldName(element.name)] = arraySchema;
		} else if (isFormElement(element)) {
			if (isStatic(element.fieldType)) continue;
			const fieldSchema = generateFieldSchema(element);
			schemaObject[sanitizeFieldName(element.name)] = fieldSchema;
		}
	}
};

// Helper function to process array fields
const processArrayFields = (
	fields: (FormElement | FormArray | FormElement[])[],
): Record<string, ZodType> => {
	const schemaObject: Record<string, ZodType> = {};

	for (const field of fields) {
		if (Array.isArray(field)) {
			processFormElements(field, schemaObject);
			continue;
		}

		if (isFormArray(field)) {
			// Handle nested arrays - for simplicity, we'll create a basic object schema
			// This can be extended if more complex nested array support is needed
			// Use the template arrayField for schema generation
			const actualFields = field.arrayField;
			const nestedSchema = processArrayFields(actualFields);
			const arraySchema = z.array(z.object(nestedSchema));
			const fieldName = field.name.split(".").pop() || field.name;
			schemaObject[sanitizeFieldName(fieldName)] = arraySchema;
		} else if (isFormElement(field)) {
			if (isStatic(field.fieldType)) continue;
			const fieldSchema = generateFieldSchema(field);
			const fieldName = field.name.split(".").pop() || field.name;
			schemaObject[sanitizeFieldName(fieldName)] = fieldSchema;
		}
	}

	return schemaObject;
};

export const generateZodSchemaObject = (
	formElements: (FormElement | FormArray)[],
): z.ZodObject<Record<string, ZodType>> => {
	const schemaObject: Record<string, ZodType> = {};
	processFormElements(formElements, schemaObject);
	return z.object(schemaObject);
};

export const generateZodSchemaString = (schema: ZodType): string => {
	if (schema instanceof z.ZodDefault) {
		const defaultSchema = schema as z.ZodDefault<ZodType>;
		return `${generateZodSchemaString(defaultSchema.def.innerType)}.default(${JSON.stringify(defaultSchema._def.defaultValue)})`;
	}

	if (schema instanceof z.ZodBoolean) {
		return "z.boolean()";
	}

	if (schema instanceof z.ZodEmail) {
		return `z.email()`;
	}

	if (schema instanceof z.ZodNumber) {
		const numberSchema = schema as z.ZodNumber;
		let result = "z.number()";
		// In Zod v4, constraints are stored in the checks array with _zod.def structure
		if (
			"checks" in numberSchema.def &&
			numberSchema.def.checks &&
			Array.isArray(numberSchema.def.checks)
		) {
			for (const check of numberSchema.def.checks) {
				// Check if the check object has the _zod property (Zod v4 structure)
				if (
					typeof check === "object" &&
					check !== null &&
					"_zod" in check &&
					check._zod &&
					typeof check._zod === "object" &&
					check._zod !== null &&
					"def" in check._zod
				) {
					const checkDef = check._zod.def;
					if (
						typeof checkDef === "object" &&
						checkDef !== null &&
						"check" in checkDef &&
						"value" in checkDef
					) {
						if (checkDef.check === "greater_than") {
							result += `.min(${checkDef.value}, "Must be at least ${checkDef.value}")`;
						} else if (checkDef.check === "less_than") {
							result += `.max(${checkDef.value}, "Must be at most ${checkDef.value}")`;
						}
					}
				}
				// Fallback for older Zod versions or different structures
				else if (
					typeof check === "object" &&
					check !== null &&
					"kind" in check
				) {
					if (check.kind === "min" && "value" in check) {
						result += `.min(${check.value}, "Must be at least ${check.value}")`;
					} else if (check.kind === "max" && "value" in check) {
						result += `.max(${check.value}, "Must be at most ${check.value}")`;
					}
				}
			}
		}

		return result;
	}

	if (schema instanceof z.ZodString) {
		const stringSchema = schema as z.ZodString;
		let result = "z.string()";
		let hasMinConstraint = false;

		if (
			"checks" in stringSchema.def &&
			stringSchema.def.checks &&
			Array.isArray(stringSchema.def.checks)
		) {
			for (const check of stringSchema.def.checks) {
				// Handle different check structures
				if (typeof check === "object" && check !== null && "kind" in check) {
					if (check.kind === "min" && "value" in check && "message" in check) {
						result += `.min(${check.value}, "${check.message || ""}")`;
						hasMinConstraint = true;
					} else if (
						check.kind === "max" &&
						"value" in check &&
						"message" in check
					) {
						result += `.max(${check.value}, "${check.message || ""}")`;
					} else if (check.kind === "nonempty" && "message" in check) {
						result += `.nonempty("${check.message || ""}")`;
						hasMinConstraint = true;
					}
					// Handle Zod v4 structure with _zod property
					else if (
						"_zod" in check &&
						check._zod &&
						typeof check._zod === "object" &&
						check._zod !== null &&
						"def" in check._zod
					) {
						const checkDef = check._zod.def;
						if (
							typeof checkDef === "object" &&
							checkDef !== null &&
							"check" in checkDef &&
							"value" in checkDef &&
							"message" in checkDef
						) {
							if (checkDef.check === "min") {
								result += `.min(${checkDef.value}, "${checkDef.message || ""}")`;
								hasMinConstraint = true;
							} else if (checkDef.check === "max") {
								result += `.max(${checkDef.value}, "${checkDef.message || ""}")`;
							}
						}
					}
				}
			}
		}

		// If this is not an optional string and doesn't have min constraint, add default min(1)
		// This handles the case where required string fields should have min validation
		if (!hasMinConstraint && !(schema instanceof z.ZodOptional)) {
			result += `.min(1, "This field is required")`;
		}

		return result;
	}

	if (schema instanceof z.ZodDate) {
		return "z.string({error : 'This field is required'})";
	}

	if (schema instanceof z.ZodArray) {
		const elementString = generateZodSchemaString(schema.element as ZodType);
		// For FormArrays, don't add nonempty validation by default
		return `z.array(${elementString})`;
	}

	if (schema instanceof z.ZodTuple) {
		const tupleSchema = schema as z.ZodTuple;
		return `z.tuple([${tupleSchema.def.items.map((item) => generateZodSchemaString(item as ZodType)).join(", ")}])`;
	}

	if (schema instanceof z.ZodObject) {
		const shape = schema.shape;
		const shapeStrs = Object.entries(shape).map(([key, value]) => {
			// Quote keys that need it (contain spaces or start with number)
			const needsQuotes = /\s/.test(key) || /^\d/.test(key);
			const quotedKey = needsQuotes ? `"${key}"` : key;
			return `${quotedKey}: ${generateZodSchemaString(value as ZodType)}`;
		});
		return `
    z.object({
      ${shapeStrs.join(",\n  ")}
    })`;
	}

	if (schema instanceof z.ZodOptional) {
		return `${generateZodSchemaString(schema.unwrap() as ZodType)}.optional()`;
	}

	return "z.unknown()";
};

export const getZodSchemaString = (
	formElements: FormStep[] | (FormElement | FormArray)[],
	isMultiStep = false,
	schemaName = "formSchema",
): string => {
	const flattenedElements = isMultiStep
		? flattenFormSteps(formElements as FormStep[]).flat()
		: (formElements as (FormElement | FormArray)[]);

	const schema = generateZodSchemaObject(flattenedElements);
	const schemaEntries = Object.entries(schema.shape)
		.map(([key, value]) => {
			// Quote keys that need it (contain spaces or start with number)
			const needsQuotes = /\s/.test(key) || /^\d/.test(key);
			const quotedKey = needsQuotes ? `"${key}"` : key;
			return `${quotedKey}: ${generateZodSchemaString(value as ZodType)}`;
		})
		.join(",\n");

	let code = `
  import * as z from "zod"
  export const ${schemaName}Schema = z.object({\n${schemaEntries}\n});`;

	if (isMultiStep) {
		const stepFields = getStepFields(formElements as FormStep[]);
		const stepSchemasStr = Object.entries(stepFields)
			.map(([stepIndex, fieldNames]) => {
				const pickObj = fieldNames.reduce(
					(acc, name) => {
						acc[sanitizeFieldName(name)] = true;
						return acc;
					},
					{} as Record<string, boolean>,
				);
				const pickStr = Object.keys(pickObj)
					.map((key) => `${key}: true`)
					.join(",\n  ");
				return `  // Step ${Number.parseInt(stepIndex, 10) + 1}\n  ${schemaName}.pick({\n  ${pickStr}\n  })`;
			})
			.join(",\n");

		code += `

export const ${schemaName}SchemaSteps = [
${stepSchemasStr}
];`;
	}

	return code;
};
