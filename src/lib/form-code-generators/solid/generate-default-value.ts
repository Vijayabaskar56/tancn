import { flattenFormSteps } from "@/lib/form-elements-helpers";
import type {
	FormArray,
	FormElement,
	FormElementOrList,
	FormStep,
} from "@/types/form-types";

type DefaultValue =
	| string
	| number
	| boolean
	| string[]
	| Record<string, unknown>[];
type FieldTypeWithOptions = FormElement & {
	options?: Array<{ value: string; label: string }>;
};
type FieldTypeWithType = FormElement & { type?: "single" | "multiple" };
type FieldTypeWithMin = FormElement & { min?: number };

const FORM_ELEMENT_DEFAULTS: Record<
	string,
	(field: FormElement) => DefaultValue
> = {
	Input: (field: FormElement) => {
		const inputField = field as FormElement & { type?: string };
		return inputField.type === "number" ? 0 : "";
	},
	Password: () => "",
	Textarea: () => "",
	OTP: () => "",
	DatePicker: () => "",
	Checkbox: () => false,
	Switch: () => false,
	RadioGroup: (field: FormElement) => {
		const fieldWithOptions = field as FieldTypeWithOptions;
		return fieldWithOptions.options?.[0]?.value ?? "";
	},
	Select: (field: FormElement) => {
		const fieldWithOptions = field as FieldTypeWithOptions;
		return fieldWithOptions.options?.[0]?.value ?? "";
	},
	MultiSelect: () => [],
	ToggleGroup: (field: FormElement) => {
		const fieldWithType = field as FieldTypeWithType;
		if (fieldWithType.type === "multiple") {
			return [];
		}
		const fieldWithOptions = field as FieldTypeWithOptions;
		return fieldWithOptions.options?.[0]?.value ?? "";
	},
	Slider: (field: FormElement) => {
		const fieldWithMin = field as FieldTypeWithMin;
		return typeof fieldWithMin.min === "number" ? fieldWithMin.min : 0;
	},
};

// Object map for FormArray defaults
const FORM_ARRAY_DEFAULTS: Record<string, (field: FormArray) => DefaultValue> =
	{
		FormArray: (field: FormArray) => {
			// Use the template arrayField for defaults, not runtime entries
			const defaultEntry = processFormElements(
				field.arrayField as FormElementOrList[],
			);
			return [defaultEntry];
		},
	};

/**
 * Gets the appropriate default value for a form field based on its type
 */
export const getFieldDefaultValue = (
	field: FormElement | FormArray,
): DefaultValue | undefined => {
	if ("static" in field && field.static) {
		return undefined; // Static elements don't need default values
	}

	// Handle FormArray separately
	if (field.fieldType === "FormArray") {
		const defaultFn = FORM_ARRAY_DEFAULTS[field.fieldType];
		return defaultFn ? defaultFn(field as FormArray) : [];
	}

	// Handle FormElement
	const defaultFn = FORM_ELEMENT_DEFAULTS[field.fieldType];
	return defaultFn ? defaultFn(field as FormElement) : ""; // Default fallback
};

/**
 * Type guard to check if an element is static
 */
const isStaticElement = (element: FormElement): boolean => {
	return "static" in element && element.static === true;
};

/**
 * Type guard to check if an element is a FormElement (not an array)
 */
const isFormElement = (element: FormElementOrList): element is FormElement => {
	return !Array.isArray(element);
};

/**
 * Sanitizes field names by replacing hyphens with underscores
 */
const sanitizeFieldName = (name: string): string => {
	return name.replace(/-/g, "_");
};

/**
 * Recursively processes form elements to build default values object
 */
export const processFormElements = (
	elements: FormElementOrList[],
): Record<string, DefaultValue> => {
	const defaults: Record<string, DefaultValue> = {};
	for (const element of elements) {
		if (Array.isArray(element)) {
			// Handle nested array of elements
			for (const nestedElement of element) {
				if (isFormElement(nestedElement)) {
					if (!isStaticElement(nestedElement) && nestedElement.name) {
						const defaultValue = getFieldDefaultValue(nestedElement);
						if (defaultValue !== undefined) {
							const fieldName =
								nestedElement.name.split(".").pop() || nestedElement.name;
							defaults[sanitizeFieldName(fieldName)] = defaultValue;
						}
					}
				}
			}
		} else {
			// Handle single element
			if (!isStaticElement(element) && element.name) {
				const defaultValue = getFieldDefaultValue(element);
				if (defaultValue !== undefined) {
					const fieldName = element.name.split(".").pop() || element.name;
					defaults[fieldName] = defaultValue;
				}
			}
		}
	}

	return defaults;
};

/**
 * Recursively converts a value to a JavaScript literal string with proper quoting
 */
const valueToLiteralString = (value: unknown): string => {
	if (typeof value === "string") {
		return `"${value}"`;
	}
	if (typeof value === "boolean") {
		return value.toString();
	}
	if (typeof value === "number") {
		return value.toString();
	}
	if (Array.isArray(value)) {
		if (value.length === 0) {
			return "[] as string[]";
		}
		const arrayItems = value.map((item) => valueToLiteralString(item));
		return `[\n  ${arrayItems.join(",\n  ")}\n]`;
	}
	if (typeof value === "object" && value !== null) {
		return objectToLiteralString(value as Record<string, unknown>);
	}
	return String(value);
};

/**
 * Converts an object to a JavaScript object literal string with properly quoted keys
 */
export const objectToLiteralString = (obj: Record<string, unknown>): string => {
	const entries = Object.entries(obj);

	if (entries.length === 0) {
		return "{}";
	}

	const formattedEntries = entries.map(([key, value]) => {
		const valueStr = valueToLiteralString(value);

		// Quote keys that need it (contain spaces or start with number)
		const needsQuotes = /\s/.test(key) || /^\d/.test(key);
		const quotedKey = needsQuotes ? `"${key}"` : key;

		return `  ${quotedKey}: ${valueStr}`;
	});

	return `{\n${formattedEntries.join(",\n")}\n}`;
};

/**
 * Type guard to check if an element is a FormArray
 */
const isFormArray = (element: unknown): element is FormArray => {
	return (
		typeof element === "object" &&
		element !== null &&
		"arrayField" in element &&
		"fieldType" in element &&
		element.fieldType === "FormArray"
	);
};

/**
 * Type guard to check if an element is a FormStep
 */
const isFormStep = (element: unknown): element is FormStep => {
	return (
		typeof element === "object" &&
		element !== null &&
		"stepFields" in element &&
		"id" in element &&
		Array.isArray((element as FormStep).stepFields)
	);
};

/**
 * Type guard to check if formElements is a multi-step form
 */
const isMultiStepForm = (
	formElements: unknown[],
): formElements is FormStep[] => {
	return formElements.length > 0 && isFormStep(formElements[0]);
};

/**
 * Recursively processes form elements including FormArrays
 */
export const getDefaultFormElement = (
	elements: (FormElementOrList | FormArray)[],
): Record<string, DefaultValue> => {
	const defaults: Record<string, DefaultValue> = {};
	for (const element of elements) {
		if (isFormArray(element)) {
			// Handle FormArray
			if (element.name) {
				const defaultValue = getFieldDefaultValue(element);
				if (defaultValue !== undefined) {
					defaults[sanitizeFieldName(element.name)] = defaultValue;
				}
			}
		} else if (Array.isArray(element)) {
			// Handle nested array of elements (FormElement[])
			for (const nestedElement of element) {
				if (isFormArray(nestedElement)) {
					// Handle nested FormArray
					const formArray = nestedElement as FormArray;
					if (formArray.name) {
						const defaultValue = getFieldDefaultValue(formArray);
						if (defaultValue !== undefined) {
							defaults[sanitizeFieldName(formArray.name)] = defaultValue;
						}
					}
				} else {
					// Handle regular FormElement
					if (!Array.isArray(nestedElement)) {
						const formElement = nestedElement as FormElement;
						if (!isStaticElement(formElement) && formElement.name) {
							const defaultValue = getFieldDefaultValue(formElement);
							if (defaultValue !== undefined) {
								defaults[sanitizeFieldName(formElement.name)] = defaultValue;
							}
						}
					}
				}
			}
		} else {
			// Handle single element (FormElement)
			const formElement = element as FormElement;
			if (!isStaticElement(formElement) && formElement.name) {
				const defaultValue = getFieldDefaultValue(formElement);
				if (defaultValue !== undefined) {
					defaults[formElement.name] = defaultValue;
				}
			}
		}
	}

	return defaults;
};

export const getDefaultValuesString = (
	validationSchema: string | undefined,
	schemaName: string,
	formElements: unknown[],
) => {
	// Handle multi-step forms by flattening them to a single list of elements
	let elementsToProcess = formElements;
	if (isMultiStepForm(formElements)) {
		elementsToProcess = flattenFormSteps(formElements);
	}

	// Generate default values based on form field types, including FormArrays
	const defaultValues = getDefaultFormElement(
		elementsToProcess as (FormElementOrList | FormArray)[],
	);

	// Convert the defaults object to a JavaScript object literal string
	const defaultsString = objectToLiteralString(defaultValues);

	const schema = validationSchema || "zod";
	switch (schema) {
		case "zod":
			return `${defaultsString} as z.input<typeof ${schemaName}>`;
		case "valibot":
			return `${defaultsString} as v.InferInput<typeof ${schemaName}>`;
		case "arktype":
			return `${defaultsString} as typeof ${schemaName}.infer`;
		default:
			return `${defaultsString} as z.input<typeof ${schemaName}>`;
	}
};

