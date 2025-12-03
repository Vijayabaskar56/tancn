// generate-arktype-schema.tsx
import { type Type, type } from "arktype";
import type { FormArray, FormElement } from "@/types/form-types";
import { isStatic } from "@/utils/utils";

/** Record of field names to ArkType schemas */
type ArkTypeSchemaRecord = Record<string, Type>;

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

// Type for field schema generators
type FieldSchemaGenerator = (element: FormElement) => any;

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
					return type("string.email");
				} else if (element.type === "number") {
					return type("number");
				}
			}
			return type("string >= 1");
		},
	],
	[
		"Password",
		(element) => {
			if (hasTypeProperty(element)) {
				if (element.type === "email") {
					return type("string.email");
				} else if (element.type === "number") {
					return type("number");
				}
			}
			return type("string >= 1");
		},
	],
	[
		"OTP",
		(element) => {
			const maxLength = hasMaxLengthProperty(element)
				? element.maxLength || 6
				: 6;
			return type(`string >= ${maxLength}`);
		},
	],
	["DatePicker", () => type("Date")],
	["Checkbox", () => type("boolean")],
	[
		"Slider",
		(element) => {
			if (hasMinMaxProperties(element)) {
				if (element.min !== undefined && element.max !== undefined) {
					return type(`number >= ${element.min} & number <= ${element.max}`);
				} else if (element.min !== undefined) {
					return type(`number >= ${element.min}`);
				} else if (element.max !== undefined) {
					return type(`number <= ${element.max}`);
				}
			}
			return type("number");
		},
	],
	["Switch", () => type("boolean")],
	["Select", () => type("string >= 1")],
	[
		"ToggleGroup",
		(element) => {
			if (hasTypeProperty(element) && element.type === "single") {
				return type("string >= 1");
			}
			return type("string[] >= 1");
		},
	],
	["MultiSelect", () => type("string[] >= 1")],
	["RadioGroup", () => type("string >= 1")],
	["Textarea", () => type("string >= 10")],
	// Static elements - should not reach here due to isStatic check
	["H1", () => type("string")],
	["H2", () => type("string")],
	["H3", () => type("string")],
	["Separator", () => type("string")],
]);

// Helper function to generate schema for a single field
const generateFieldSchema = (element: FormElement): Type => {
	const generator = FIELD_SCHEMA_MAP.get(element.fieldType);
	if (!generator) {
		return type("string");
	}

	const baseSchema = generator(element);

	// Handle optional fields - ArkType uses union with undefined for optional
	if (!("required" in element) || element.required !== true) {
		return baseSchema.or("undefined");
	}

	return baseSchema;
};

// Helper function to process form elements recursively
const processFormElements = (
	elements: (FormElement | FormArray | FormElement[])[],
	schemaObject: ArkTypeSchemaRecord,
): void => {
	for (const element of elements) {
		if (Array.isArray(element)) {
			processFormElements(element, schemaObject);
			continue;
		}

		if (isFormArray(element)) {
			const arrayItemSchema = processArrayFields(element.arrayField);
			const arrayItemType = type(arrayItemSchema);
			let elementSchema: Type<unknown[]> | Type<unknown[] | undefined> = type([
				arrayItemType,
				"[]",
			]);

			if (!("required" in element) || element.required !== true) {
				elementSchema = elementSchema.or("undefined");
			}

			schemaObject[element.name] = elementSchema;
		} else if (isFormElement(element)) {
			if (isStatic(element.fieldType)) continue;
			const fieldSchema = generateFieldSchema(element);
			const fieldName = element.name.split(".").pop() || element.name;
			schemaObject[fieldName] = fieldSchema;
		}
	}
};

// Helper function to process array fields
const processArrayFields = (
	fields: (FormElement | FormArray | FormElement[])[],
): ArkTypeSchemaRecord => {
	const schemaObject: ArkTypeSchemaRecord = {};

	for (const field of fields) {
		if (Array.isArray(field)) {
			processFormElements(field, schemaObject);
			continue;
		}

		if (isFormArray(field)) {
			// Handle nested arrays - for simplicity, we'll create a basic object schema
			const nestedSchema = processArrayFields(field.arrayField);
			const nestedType = type(nestedSchema);
			const arraySchema = type([nestedType, "[]"]);
			schemaObject[field.name] = arraySchema;
		} else if (isFormElement(field)) {
			if (isStatic(field.fieldType)) continue;
			const fieldSchema = generateFieldSchema(field);
			schemaObject[field.name] = fieldSchema;
		}
	}

	return schemaObject;
};

export const generateArkTypeSchemaObject = (
	formElements: (FormElement | FormArray)[],
): Type => {
	const schemaObject: ArkTypeSchemaRecord = {};

	const addType = (element: FormElement | FormArray): void => {
		if (isFormArray(element)) {
			// Handle FormArray
			// Use the template arrayField for schema generation
			const actualFields = element.arrayField;
			const arraySchema = generateArkTypeSchemaObject(
				actualFields as FormElement[],
			);
			let elementSchema: Type<unknown[]> | Type<unknown[] | undefined> = type([
				arraySchema,
				"[]",
			]);

			if (!("required" in element) || element.required !== true) {
				elementSchema = elementSchema.or("undefined");
			}

			schemaObject[element.name] = elementSchema;
			return;
		}

		// Handle regular FormElement
		if (isStatic(element.fieldType)) return;

		const generator = FIELD_SCHEMA_MAP.get(element.fieldType);
		let elementSchema: Type;

		if (generator) {
			elementSchema = generator(element);
		} else {
			elementSchema = type("string");
		}

		// Add validation constraints for Slider
		if (element.fieldType === "Slider") {
			if (hasMinMaxProperties(element)) {
				if (element.min !== undefined && element.max !== undefined) {
					elementSchema = type(
						`number >= ${element.min} & number <= ${element.max}`,
					);
				} else if (element.min !== undefined) {
					elementSchema = type(`number >= ${element.min}`);
				} else if (element.max !== undefined) {
					elementSchema = type(`number <= ${element.max}`);
				}
			}
		}

		// Handle required/optional fields - ArkType uses union with undefined for optional
		if (!("required" in element) || element.required !== true) {
			elementSchema = elementSchema.or("undefined");
		}

		const fieldName = element.name.split(".").pop() || element.name;
		schemaObject[fieldName] = elementSchema;
	};

	// Process all elements, handling both arrays and single elements
	formElements.forEach((element) => {
		if (Array.isArray(element)) {
			element.forEach(addType);
		} else {
			addType(element);
		}
	});

	return type(schemaObject);
};
export const generateArkTypeSchemaString = (schema: any): string => {
	if (!schema) return '"unknown"';

	// Handle string literals directly
	if (typeof schema === "string") {
		return `"${schema}"`;
	}

	// Try to extract the original definition string from ArkType
	if (schema.definition) {
		return `"${schema.definition}"`;
	}

	// Handle ArkType internal structure
	if (schema.inner) {
		return generateArkTypeSchemaString(schema.inner);
	}

	// Handle morphs (transformations)
	if (schema.kind === "morph") {
		return generateArkTypeSchemaString(schema.from);
	}

	// Handle unions (including optional fields)
	if (schema.kind === "union") {
		if (schema.branches?.length === 2) {
			const nonUndefined = schema.branches.find(
				(b: any) => b.kind !== "unit" || b.unit !== undefined,
			);
			const hasUndefined = schema.branches.some(
				(b: any) => b.kind === "unit" && b.unit === undefined,
			);

			if (hasUndefined && nonUndefined) {
				// This is an optional field
				return `${generateArkTypeSchemaString(nonUndefined)} | undefined`;
			}
		}

		const unionStrs =
			schema.branches?.map((branch: any) =>
				generateArkTypeSchemaString(branch),
			) || [];
		return unionStrs.join(" | ");
	}

	// Handle intersections
	if (schema.kind === "intersection") {
		const intersectionStrs =
			schema.branches?.map((branch: any) =>
				generateArkTypeSchemaString(branch),
			) || [];
		return intersectionStrs.join(" & ");
	}

	// Handle constraints
	if (schema.kind === "constraint") {
		const base = generateArkTypeSchemaString(schema.base || schema.in);
		if (schema.rule) {
			const rule = schema.rule;
			if (rule.rule !== undefined) {
				if (rule.kind === "min") {
					return `"${base.replace(/"/g, "")} >= ${rule.rule}"`;
				}
				if (rule.kind === "max") {
					return `"${base.replace(/"/g, "")} <= ${rule.rule}"`;
				}
				if (rule.kind === "length") {
					return `"${base.replace(/"/g, "")} >= ${rule.rule}"`;
				}
				if (rule.kind === "regex" && rule.rule.source.includes("@")) {
					return '"string.email"';
				}
			}
		}
		return base;
	}

	// Handle primitive types
	if (schema.kind === "unit") {
		if (schema.unit === undefined) return "undefined";
		if (typeof schema.unit === "string") return `"${schema.unit}"`;
		return schema.unit.toString();
	}

	if (schema.kind === "domain") {
		switch (schema.domain) {
			case "string":
				return '"string"';
			case "number":
				return '"number"';
			case "boolean":
				return '"boolean"';
			case "object":
				return '"object"';
			case "bigint":
				return '"bigint"';
			case "symbol":
				return '"symbol"';
		}
	}

	// Handle built-in types
	if (schema.kind === "proto") {
		if (schema.proto === Date) return '"Date"';
		if (schema.proto === Array) return '"unknown[]"';
		if (schema.proto === RegExp) return '"RegExp"';
	}

	// Handle arrays
	if (schema.kind === "array") {
		const element = generateArkTypeSchemaString(schema.element);
		// For arrays with unknown elements, generate array without element type
		if (element === '"unknown"') {
			return '"unknown[] >= 1"';
		}
		return `"${element.replace(/"/g, "")}[]"`;
	}

	// Handle sequence (array with constraints)
	if (schema.kind === "sequence") {
		const element = generateArkTypeSchemaString(schema.element);
		if (schema.prefix?.length) {
			const constraints = schema.prefix
				.map((p: any) => {
					if (p.kind === "constraint" && p.rule?.kind === "min") {
						return ` >= ${p.rule.rule}`;
					}
					return "";
				})
				.join("");
			return `"${element.replace(/"/g, "")}[]${constraints}"`;
		}
		return `"${element.replace(/"/g, "")}[]"`;
	}

	// Handle objects
	if (schema.kind === "structure") {
		const required = schema.required || [];
		const optional = schema.optional || [];
		const entries: string[] = [];

		required.forEach((entry: any) => {
			if (entry.key && entry.value) {
				// Quote keys that need it (contain spaces or start with number)
				const needsQuotes = /\s/.test(entry.key) || /^\d/.test(entry.key);
				const quotedKey = needsQuotes ? `"${entry.key}"` : entry.key;
				entries.push(
					`${quotedKey}: ${generateArkTypeSchemaString(entry.value)}`,
				);
			}
		});

		optional.forEach((entry: any) => {
			if (entry.key && entry.value) {
				// Quote keys that need it (contain spaces or start with number)
				const needsQuotes = /\s/.test(entry.key) || /^\d/.test(entry.key);
				const quotedKey = needsQuotes ? `"${entry.key}?"` : `${entry.key}?`;
				entries.push(
					`${quotedKey}: ${generateArkTypeSchemaString(entry.value)}`,
				);
			}
		});

		return `{ ${entries.join(", ")} }`;
	}

	// Fallback - try to determine from domain/kind
	if (schema.domain === "string") return '"string"';
	if (schema.domain === "number") return '"number"';
	if (schema.domain === "boolean") return '"boolean"';
	if (schema.kind === "Date") return '"Date"';

	return '"unknown"';
};
export const getArkTypeSchemaString = (
	formElements: (FormElement | FormArray)[],
	isMultiStep: boolean = false,
	stepSchemas?: (FormElement | FormArray)[][],
	schemaName: string = "formSchema",
): string => {
	// Generate ArkType definitions directly from form elements
	const processElements = (elements: (FormElement | FormArray)[]): string[] => {
		return elements
			.filter((element) => {
				if (isFormArray(element)) return true;
				return !isStatic(element.fieldType);
			})
			.map((element) => {
				if (isFormArray(element)) {
					// Handle FormArray
					// Use the template arrayField for schema generation
					const actualFields = element.arrayField;
					const arrayFieldSchemas = processElements(
						actualFields as FormElement[],
					);
					const arrayObjectSchema = `{\n${arrayFieldSchemas.join(",\n")}\n  }`;
					const typeDefinition = `"${arrayObjectSchema}[]"`;

					// Handle optional FormArray
					if (!("required" in element) || element.required !== true) {
						// Quote keys that need it (contain spaces or start with number)
						const needsQuotes =
							/\s/.test(element.name) || /^\d/.test(element.name);
						const quotedKey = needsQuotes
							? `"${element.name}?"`
							: `${element.name}?`;
						return `  ${quotedKey}: ${typeDefinition}`;
					} else {
						// Quote keys that need it (contain spaces or start with number)
						const needsQuotes =
							/\s/.test(element.name) || /^\d/.test(element.name);
						const quotedKey = needsQuotes ? `"${element.name}"` : element.name;
						return `  ${quotedKey}: ${typeDefinition}`;
					}
				}

				// Handle regular FormElement
				let typeDefinition: string;

				const generator = FIELD_SCHEMA_MAP.get(element.fieldType);
				if (generator) {
					// For string generation, we create simplified type definitions
					switch (element.fieldType) {
						case "Input":
						case "Password":
							if (hasTypeProperty(element)) {
								if (element.type === "email") {
									typeDefinition = '"string.email"';
								} else if (element.type === "number") {
									typeDefinition = '"number"';
								} else {
									typeDefinition = '"string"';
								}
							} else {
								typeDefinition = '"string"';
							}
							break;

						case "OTP": {
							const maxLength = hasMaxLengthProperty(element)
								? element.maxLength || 6
								: 6;
							typeDefinition = `"string >= ${maxLength}"`;
							break;
						}

						case "DatePicker":
							typeDefinition = '"Date"';
							break;

						case "Checkbox":
							typeDefinition = '"boolean"';
							break;

						case "Slider":
							if (hasMinMaxProperties(element)) {
								if (element.min !== undefined && element.max !== undefined) {
									typeDefinition = `"number >= ${element.min} & number <= ${element.max}"`;
								} else if (element.min !== undefined) {
									typeDefinition = `"number >= ${element.min}"`;
								} else if (element.max !== undefined) {
									typeDefinition = `"number <= ${element.max}"`;
								} else {
									typeDefinition = '"number"';
								}
							} else {
								typeDefinition = '"number"';
							}
							break;

						case "Switch":
							typeDefinition = '"boolean"';
							break;

						case "Select":
							typeDefinition = '"string >= 1"';
							break;

						case "ToggleGroup":
							if (hasTypeProperty(element) && element.type === "single") {
								typeDefinition = '"string >= 1"';
							} else {
								typeDefinition = '"unknown[] >= 1"';
							}
							break;

						case "MultiSelect":
							typeDefinition = '"string[] >= 1"';
							break;

						case "RadioGroup":
							typeDefinition = '"string >= 1"';
							break;

						case "Textarea":
							typeDefinition = '"string >= 10"';
							break;

						default:
							typeDefinition = '"string"';
					}
				} else {
					typeDefinition = '"string"';
				}

				// Strip prefix from field name
				const fieldName = element.name.split(".").pop() || element.name;

				// Handle optional fields - ArkType uses the ? syntax or union with undefined
				if (!("required" in element) || element.required !== true) {
					// Quote keys that need it (contain spaces or start with number)
					const needsQuotes = /\s/.test(fieldName) || /^\d/.test(fieldName);
					const quotedKey = needsQuotes ? `"${fieldName}?"` : `${fieldName}?`;
					return `  ${quotedKey}: ${typeDefinition}`;
				}
				// Quote keys that need it (contain spaces or start with number)
				const needsQuotes = /\s/.test(fieldName) || /^\d/.test(fieldName);
				const quotedKey = needsQuotes ? `"${fieldName}"` : fieldName;
				return `  ${quotedKey}: ${typeDefinition}`;
			});
	};

	const schemaEntries = processElements(formElements).join(",\n");

	let code = `import { type } from "arktype"

export const ${schemaName}Schema = type({
${schemaEntries}
});`;

	if (isMultiStep && stepSchemas) {
		const stepSchemasStr = stepSchemas
			.map((stepSchema, index) => {
				const stepEntries = processElements(stepSchema).join(",\n");
				return `  // Step ${index + 1}\n  type({\n${stepEntries}\n  })`;
			})
			.join(",\n");

		code += `

export const ${schemaName}SchemaSteps = [
${stepSchemasStr}
];`;
	}

	return code;
};
