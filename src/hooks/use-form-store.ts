import { createClientOnlyFn } from "@tanstack/react-start";
import { useStore } from "@tanstack/react-store";
import { batch, Derived, Store } from "@tanstack/store";
import { v4 as uuid } from "uuid";
import type {
	Framework,
	ValidationSchema,
} from "@/components/form-components/types";
import { defaultFormElements } from "@/constants/default-form-element";
import { templates } from "@/constants/templates";
import type {
	AppendElement,
	DropElement,
	EditElement,
	FormArray,
	FormArrayEntry,
	FormElement,
	FormElementList,
	FormElementOrList,
	FormElements,
	FormStep,
	ReorderElements,
	SetTemplate,
} from "@/types/form-types";
import {
	dropAtIndex,
	flattenFormSteps,
	insertAtIndex,
	transformToStepFormList,
} from "../lib/form-elements-helpers";

// Client-only functions defined inside the initialization function to avoid SSR issues
const getSharedData = () => {
	const getShared = createClientOnlyFn(() => {
		return localStorage.getItem("share");
	});
	return getShared();
};

const removeSharedData = () => {
	const removeShared = createClientOnlyFn(() => {
		return localStorage.removeItem("share");
	});
	return removeShared();
};

// Core state type without actions
type FormBuilderCoreState = {
	isMS: boolean;
	formElements: FormElements;
	formName: string;
	schemaName: string;
	validationSchema: ValidationSchema;
	framework: Framework;
	lastAddedStepIndex?: number;
};
// Actions type
export type FormBuilderActions = {
	setFormName: (formName: string) => void;
	setSchemaName: (schemaName: string) => void;
	setValidationSchema: (validationSchema: ValidationSchema) => void;
	setFramework: (framework: Framework) => void;
	setFormElements: (formElements: FormElements) => void;
	// Save/Load functions
	saveForm: (formName: string) => void;
	loadForm: (formName: string) => boolean;
	getSavedForms: () => Array<{
		name: string;
		data: Record<string, unknown>;
		createdAt: string;
	}>;
	deleteSavedForm: (formName: string) => boolean;
	appendElement: AppendElement;
	dropElement: DropElement;
	editElement: EditElement;
	reorder: ReorderElements;
	setTemplate: SetTemplate;
	resetFormElements: () => void;
	setIsMS: (isMS: boolean) => void;
	addFormArray: (arrayField: FormElementList | [], stepIndex?: number) => void;
	removeFormArray: (id: string) => void;
	updateFormArray: (id: string, arrayField: FormElementList) => void;
	updateFormArrayProperties: (
		id: string,
		properties: Partial<FormArray>,
	) => void;
	reorderFormArray: (id: string, newOrder: FormElementList) => void;
	// Array entry management
	addFormArrayEntry: (arrayId: string) => void;
	removeFormArrayEntry: (arrayId: string, entryId: string) => void;
	updateFormArrayEntry: (
		arrayId: string,
		entryId: string,
		fields: FormElementList,
	) => void;
	// Array field management
	removeFormArrayField: (arrayId: string, fieldIndex: number) => void;
	updateFormArrayField: (
		arrayId: string,
		fieldIndex: number,
		updatedField: FormElement,
		nestedIndex?: number,
		updateTemplate?: boolean,
	) => void;
	addFormArrayField: (
		arrayId: string,
		fieldType: FormElement["fieldType"],
	) => void;
	reorderFormArrayFields: (arrayId: string, newOrder: FormElementList) => void;
	syncFormArrayEntries: (arrayId: string) => void;
	addFormStep: (position?: number) => void;
	removeFormStep: (stepIndex: number) => void;
	reorderSteps: (newOrder: FormStep[]) => void;
	// Batch operations
	batchAppendElements: (elements: Array<FormElementOrList>) => void;
	batchEditElements: (
		edits: Array<{
			fieldIndex: number;
			j?: number;
			stepIndex?: number;
			modifiedFormElement: FormElement;
		}>,
	) => void;
};
// Complete state type
type FormBuilderState = FormBuilderCoreState & FormBuilderActions;
// Type guard for FormStep
const isFormStep = (
	element: FormElementOrList | FormStep,
): element is FormStep => {
	return (
		typeof element === "object" &&
		element !== null &&
		"stepFields" in element &&
		Array.isArray((element as FormStep).stepFields)
	);
};
// Helper type for form elements that can be either single or array
type FormElementContainer = FormElement | FormElement[];
// Type-safe helper to check if form elements are multi-step
const isMultiStepForm = (
	formElements: FormElementList | FormStep[],
): formElements is FormStep[] => {
	return formElements.length > 0 && isFormStep(formElements[0]);
};
// Type guard for FormArray
const isFormArray = (
	element: FormElementOrList | FormStep | FormArray,
): element is FormArray => {
	return (
		typeof element === "object" &&
		element !== null &&
		"arrayField" in element &&
		Array.isArray((element as FormArray).arrayField)
	);
};
// Type-safe helper to check if form elements are form arrays
const isFormArrayForm = (
	formElements: FormElementList | FormStep[] | FormArray[],
): formElements is FormArray[] => {
	return formElements.length > 0 && isFormArray(formElements[0]);
};
// Function to get initial state with shared data check
const getInitialCoreState = (): FormBuilderCoreState => {
	let shared: string | null = null;
	const initialFormElements = templates.contactUs
		.template as FormElementOrList[];

	try {
		// Only check for shared data on client side
		if (typeof window !== "undefined") {
			shared = getSharedData();
			if (shared) {
				removeSharedData();
			}
		}
	} catch (error) {
		// If there's an error (e.g., SSR), use default
		console.warn("Could not access shared data:", error);
	}

	return {
		formElements: shared ? JSON.parse(shared) : initialFormElements,
		isMS: shared
			? isMultiStepForm(JSON.parse(shared))
			: isMultiStepForm(initialFormElements),
		formName: "draft",
		schemaName: "draftFormSchema",
		validationSchema: "zod",
		framework: "react",
		lastAddedStepIndex: undefined,
	};
};

export const initialCoreState: FormBuilderCoreState = getInitialCoreState();

const formBuilderCoreStore = new Store<FormBuilderCoreState>(initialCoreState, {
	updateFn: (prevState) => (updater) => {
		const newState =
			typeof updater === "function" ? updater(prevState) : updater;
		if (newState.formElements.length === 0 && newState.isMS) {
			// Automatically add a default step if switching to multi-step with no elements
			return {
				...newState,
				formElements: [{ id: uuid(), stepFields: [] }] as FormStep[],
			};
		}
		return newState;
	},
	onUpdate: () => {
		console.debug("Form builder state updated:", formBuilderCoreStore.state);
	},
});

class FormBuilderError extends Error {
	constructor(
		message: string,
		public code: string,
	) {
		super(message);
		this.name = "FormBuilderError";
	}
}

const validateStepIndex = (formSteps: FormStep[], stepIndex: number): void => {
	if (stepIndex < 0 || stepIndex >= formSteps.length) {
		throw new FormBuilderError(
			`Invalid step index: ${stepIndex}. Must be between 0 and ${formSteps.length - 1}`,
			"INVALID_STEP_INDEX",
		);
	}
};
const validateFieldIndex = (
	fields: FormElementList,
	fieldIndex: number,
): void => {
	if (fieldIndex < 0 || fieldIndex >= fields.length) {
		throw new FormBuilderError(
			`Invalid field index: ${fieldIndex}. Must be between 0 and ${fields.length - 1}`,
			"INVALID_FIELD_INDEX",
		);
	}
};
const validateFieldType = (
	fieldType: string,
): fieldType is keyof typeof defaultFormElements => {
	if (!(fieldType in defaultFormElements)) {
		throw new FormBuilderError(
			`Unknown field type: ${fieldType}`,
			"UNKNOWN_FIELD_TYPE",
		);
	}
	return true;
};
const syncEntriesForFormArray = (formArray: FormArray): FormArrayEntry[] => {
	return formArray.entries.map((entry: FormArrayEntry, entryIndex: number) => {
		const syncedFields = formArray.arrayField.map(
			(templateField: FormElement | FormElement[], index: number) => {
				if (Array.isArray(templateField)) {
					// Handle nested arrays
					if (Array.isArray(entry.fields[index])) {
						// Both template and existing are arrays, sync them
						return templateField.map(
							(nestedTemplate: FormElement, nestedIndex: number) => {
								const existingNested = (entry.fields[index] as FormElement[])[
									nestedIndex
								];
								if (Array.isArray(nestedTemplate)) {
									// nestedTemplate is FormElement[]
									if (Array.isArray(existingNested)) {
										// Both are arrays, sync them
										return nestedTemplate.map(
											(deepTemplate: FormElement, deepIndex: number) => {
												const existingDeep = existingNested[deepIndex];
												if (
													existingDeep &&
													existingDeep.fieldType === deepTemplate.fieldType
												) {
													const { id, name, ...existingAttrs } = existingDeep;
													return {
														...deepTemplate,
														...existingAttrs,
														id: existingDeep.id,
														name: `${formArray.name.replace(/-/g, "_")}[${entryIndex}].${deepTemplate.name.replace(/-/g, "_")}`,
													};
												}
												return {
													...deepTemplate,
													id: uuid(),
													name: `${formArray.name.replace(/-/g, "_")}[${entryIndex}].${deepTemplate.name.replace(/-/g, "_")}`,
												};
											},
										);
									}
									// Template is array but existing is not, create new
									if (
										existingNested &&
										!Array.isArray(existingNested) &&
										nestedTemplate[0] &&
										nestedTemplate[0].fieldType === existingNested.fieldType
									) {
										const { id, name, ...existingAttrs } = existingNested;
										const firstElement = {
											...nestedTemplate[0],
											...existingAttrs,
											id: existingNested.id,
											name: `${formArray.name.replace(/-/g, "_")}[${entryIndex}].${nestedTemplate[0].name.replace(/-/g, "_")}`,
										};
										return [
											firstElement,
											...nestedTemplate
												.slice(1)
												.map((deepTemplate: FormElement) => ({
													...deepTemplate,
													id: uuid(),
													name: `${formArray.name.replace(/-/g, "_")}[${entryIndex}].${deepTemplate.name.replace(/-/g, "_")}`,
												})),
										];
									}
									return nestedTemplate.map((deepTemplate: FormElement) => ({
										...deepTemplate,
										id: uuid(),
										name: `${formArray.name.replace(/-/g, "_")}[${entryIndex}].${deepTemplate.name.replace(/-/g, "_")}`,
									}));
								}
								// nestedTemplate is FormElement
								if (
									existingNested &&
									!Array.isArray(existingNested) &&
									existingNested.fieldType === nestedTemplate.fieldType
								) {
									const { id, name, ...existingAttrs } = existingNested;
									return {
										...nestedTemplate,
										...existingAttrs,
										id: existingNested.id,
										name: `${formArray.name.replace(/-/g, "_")}[${entryIndex}].${nestedTemplate.name.replace(/-/g, "_")}`,
									};
								}
								return {
									...nestedTemplate,
									id: uuid(),
									name: `${formArray.name.replace(/-/g, "_")}[${entryIndex}].${nestedTemplate.name.replace(/-/g, "_")}`,
								};
							},
						);
					}
					// Template is array but existing is not, create new nested array
					const existing = entry.fields[index];
					if (
						existing &&
						!Array.isArray(existing) &&
						templateField[0] &&
						!Array.isArray(templateField[0]) &&
						templateField[0].fieldType === existing.fieldType
					) {
						const { id, name, ...existingAttrs } = existing;
						const firstElement = {
							...templateField[0],
							...existingAttrs,
							id: existing.id,
							name: `${formArray.name.replace(/-/g, "_")}[${entryIndex}].${templateField[0].name.replace(/-/g, "_")}`,
						};
						return [
							firstElement,
							...templateField
								.slice(1)
								.map(
									(
										nestedTemplate: FormElement | FormElement[],
										_nestedIndex: number,
									) => {
										if (Array.isArray(nestedTemplate)) {
											return nestedTemplate.map(
												(deepTemplate: FormElement) => ({
													...deepTemplate,
													id: uuid(),
													name: `${formArray.name.replace(/-/g, "_")}[${entryIndex}].${deepTemplate.name.replace(/-/g, "_")}`,
												}),
											);
										}
										return {
											...nestedTemplate,
											id: uuid(),
											name: `${formArray.name.replace(/-/g, "_")}[${entryIndex}].${nestedTemplate.name.replace(/-/g, "_")}`,
										};
									},
								),
						];
					}
					return templateField.map(
						(
							nestedTemplate: FormElement | FormElement[],
							_nestedIndex: number,
						) => {
							if (Array.isArray(nestedTemplate)) {
								return nestedTemplate.map((deepTemplate: any) => ({
									...deepTemplate,
									id: uuid(),
									name: `${formArray.name.replace(/-/g, "_")}[${entryIndex}].${deepTemplate.name.replace(/-/g, "_")}`,
								}));
							}
							return {
								...nestedTemplate,
								id: uuid(),
								name: `${formArray.name.replace(/-/g, "_")}[${entryIndex}].${nestedTemplate.name.replace(/-/g, "_")}`,
							};
						},
					);
				}
				// Handle single fields
				if (
					entry.fields[index] &&
					!Array.isArray(entry.fields[index]) &&
					(entry.fields[index] as FormElement).fieldType ===
						templateField.fieldType
				) {
					// Keep existing data but update structure
					const existing = entry.fields[index] as FormElement;
					const { id, name, ...existingAttrs } = existing;
					return {
						...templateField,
						...existingAttrs,
						id: existing.id,
						name: `${formArray.name.replace(/-/g, "_")}[${entryIndex}].${templateField.name.replace(/-/g, "_")}`,
					};
				}
				// Create new field based on template
				return {
					...templateField,
					id: uuid(),
					name: `${formArray.name.replace(/-/g, "_")}[${entryIndex}].${templateField.name.replace(/-/g, "_")}`,
				};
			},
		);
		return { ...entry, fields: syncedFields };
	});
};
const createActions = (
	store: Store<FormBuilderCoreState>,
): FormBuilderActions => {
	const appendElement: AppendElement = (options) => {
		const { fieldIndex, fieldType, id, name, content, required, j, ...rest } =
			options || {
				fieldIndex: null,
			};
		validateFieldType(fieldType);
		store.setState((state) => {
			const newFormElement = {
				id: id || uuid(),
				...defaultFormElements[fieldType],
				content: content || defaultFormElements[fieldType].content,
				label: content || (defaultFormElements[fieldType] as FormElement).label,
				name: name || `${fieldType}_${Date.now()}`,
				required: true,
				fieldType,
				...rest,
			} as FormElement;
			if (state.isMS) {
				const stepIndex = options?.stepIndex ?? 0;
				const formSteps = state.formElements as FormStep[];
				validateStepIndex(formSteps, stepIndex);
				const step = formSteps[stepIndex];
				const stepFields = [...step.stepFields];
				if (typeof fieldIndex === "number") {
					validateFieldIndex(stepFields, fieldIndex);
					// Handle nested array
					const existingElement = stepFields[fieldIndex];
					if (j !== undefined && isFormArray(existingElement)) {
						// Handle nested in FormArray
						const formArray = existingElement as FormArray;
						const arrayField = [...formArray.arrayField];
						const existingField = arrayField[j];
						if (Array.isArray(existingField)) {
							arrayField[j] = [...existingField, newFormElement];
						} else {
							arrayField[j] = [existingField, newFormElement];
						}
						const updatedFormArray = { ...formArray, arrayField };
						const syncedEntries = syncEntriesForFormArray(updatedFormArray);
						(stepFields as FormElementOrList[])[fieldIndex] = {
							...updatedFormArray,
							entries: syncedEntries,
						};
					} else if (Array.isArray(existingElement)) {
						stepFields[fieldIndex] = [...existingElement, newFormElement];
					} else {
						stepFields[fieldIndex] = [existingElement, newFormElement];
					}
				} else {
					stepFields.push(newFormElement);
				}
				const updatedSteps = formSteps.map((s, i) =>
					i === stepIndex ? { ...s, stepFields } : s,
				);
				return { ...state, formElements: updatedSteps };
			}
			const formElements = state.formElements as FormElementList;
			if (typeof fieldIndex === "number") {
				const updatedElements = [...formElements];
				const existingElement = updatedElements[fieldIndex];
				if (j !== undefined && isFormArray(existingElement)) {
					// Handle nested in FormArray
					const formArray = existingElement as FormArray;
					const arrayField = [...formArray.arrayField];
					const existingField = arrayField[j];
					if (Array.isArray(existingField)) {
						arrayField[j] = [...existingField, newFormElement];
					} else {
						arrayField[j] = [existingField, newFormElement];
					}
					const updatedFormArray = { ...formArray, arrayField };
					const syncedEntries = syncEntriesForFormArray(updatedFormArray);
					updatedElements[fieldIndex] = {
						...updatedFormArray,
						entries: syncedEntries,
					} as FormArray;
				} else if (Array.isArray(existingElement)) {
					updatedElements[fieldIndex] = [...existingElement, newFormElement];
				} else {
					updatedElements[fieldIndex] = [existingElement, newFormElement];
				}
				return { ...state, formElements: updatedElements };
			}
			return { ...state, formElements: [...formElements, newFormElement] };
		});
	};
	const dropElement: DropElement = (options) => {
		store.setState((state) => {
			const { j, fieldIndex } = options;
			if (state.isMS) {
				const stepIndex = options?.stepIndex ?? 0;
				const formSteps = state.formElements as FormStep[];
				validateStepIndex(formSteps, stepIndex);
				const step = formSteps[stepIndex];
				const stepFields = [...step.stepFields];
				if (typeof j === "number") {
					validateFieldIndex(stepFields, fieldIndex);
					// Remove from nested array
					const existingElement = stepFields[fieldIndex];
					if (Array.isArray(existingElement)) {
						if (j < 0 || j >= existingElement.length) {
							throw new FormBuilderError(
								`Invalid nested index: ${j}`,
								"INVALID_NESTED_INDEX",
							);
						}
						const [updatedArray] = dropAtIndex(existingElement, j);
						stepFields[fieldIndex] =
							(updatedArray as FormElement[]).length === 1
								? (updatedArray as FormElement[])[0]
								: (updatedArray as FormElement[]);
					}
				} else {
					validateFieldIndex(stepFields, fieldIndex);
					// Remove from main step fields
					const updatedFields = dropAtIndex(stepFields, fieldIndex);
					stepFields.splice(0, stepFields.length, ...updatedFields);
				}
				const updatedSteps = formSteps.map((s, i) =>
					i === stepIndex ? { ...s, stepFields } : s,
				);
				return { ...state, formElements: updatedSteps };
			}
			const formElements = state.formElements as FormElementList;
			if (typeof j === "number" && Array.isArray(formElements[fieldIndex])) {
				validateFieldIndex(formElements, fieldIndex);
				const existingElement = formElements[fieldIndex];
				if (Array.isArray(existingElement)) {
					if (j < 0 || j >= existingElement.length) {
						throw new FormBuilderError(
							`Invalid nested index: ${j}`,
							"INVALID_NESTED_INDEX",
						);
					}
					const [updatedArray] = dropAtIndex(existingElement, j);
					const updatedElements = [...formElements];
					updatedElements[fieldIndex] =
						(updatedArray as FormElement[]).length === 1
							? (updatedArray as FormElement[])[0]
							: (updatedArray as FormElement[]);
					return { ...state, formElements: updatedElements as FormElementList };
				}
			} else {
				validateFieldIndex(formElements, fieldIndex);
				// Remove from main array
				const updatedElements = dropAtIndex(formElements, fieldIndex);
				return { ...state, formElements: updatedElements };
			}
			return state;
		});
	};

	const editElement: EditElement = (options) => {
		const { j, fieldIndex, modifiedFormElement } = options;
		store.setState((state) => {
			if (state.isMS) {
				const stepIndex = options.stepIndex ?? 0;
				const formSteps = state.formElements as FormStep[];
				validateStepIndex(formSteps, stepIndex);
				const step = formSteps[stepIndex];
				const stepFields = [...step.stepFields];
				validateFieldIndex(stepFields, fieldIndex);
				const currentElement = stepFields[fieldIndex];
				if (typeof j === "number" && Array.isArray(currentElement)) {
					if (j < 0 || j >= currentElement.length) {
						throw new FormBuilderError(
							`Invalid nested index: ${j}`,
							"INVALID_NESTED_INDEX",
						);
					}
					// Edit nested element in array
					const updatedArray = [...currentElement];
					updatedArray[j] = {
						...updatedArray[j],
						...modifiedFormElement,
					} as FormElement;
					stepFields[fieldIndex] = updatedArray;
				} else {
					// Edit single element
					stepFields[fieldIndex] = {
						...currentElement,
						...modifiedFormElement,
					} as FormElementOrList;
				}
				const updatedSteps = formSteps.map((s, i) =>
					i === stepIndex ? { ...s, stepFields } : s,
				);
				return { ...state, formElements: updatedSteps };
			}
			// Single form
			const formElements = state.formElements as FormElementList;
			const updatedElements = [...formElements];
			if (typeof j === "number" && Array.isArray(formElements[fieldIndex])) {
				validateFieldIndex(formElements, fieldIndex);
				// Edit nested element in array
				const currentElement = formElements[fieldIndex] as FormElement[];
				if (j < 0 || j >= currentElement.length) {
					throw new FormBuilderError(
						`Invalid nested index: ${j}`,
						"INVALID_NESTED_INDEX",
					);
				}
				const updatedArray = [...currentElement];
				updatedArray[j] = {
					...updatedArray[j],
					...modifiedFormElement,
				} as FormElement;
				updatedElements[fieldIndex] = updatedArray;
			} else {
				validateFieldIndex(formElements, fieldIndex);
				// Edit single element
				updatedElements[fieldIndex] = {
					...formElements[fieldIndex],
					...modifiedFormElement,
				} as FormElementOrList;
			}
			return { ...state, formElements: updatedElements };
		});
	};
	const reorder: ReorderElements = (options): void => {
		const { newOrder, fieldIndex } = options;
		store.setState((state) => {
			if (state.isMS) {
				const stepIndex = options.stepIndex ?? 0;
				const formSteps = state.formElements as FormStep[];
				validateStepIndex(formSteps, stepIndex);
				const step = formSteps[stepIndex];
				const stepFields = [...step.stepFields];
				if (typeof fieldIndex === "number") {
					validateFieldIndex(stepFields, fieldIndex);
					stepFields[fieldIndex] = newOrder as FormElementOrList;
				} else {
					stepFields.splice(
						0,
						stepFields.length,
						...(newOrder as FormElementList),
					);
				}
				const updatedSteps = formSteps.map((s, i) =>
					i === stepIndex ? { ...s, stepFields } : s,
				);
				return { ...state, formElements: updatedSteps };
			}
			// Single form
			if (typeof fieldIndex === "number") {
				const formElements = [...(state.formElements as FormElementList)];
				validateFieldIndex(formElements, fieldIndex);
				formElements[fieldIndex] = newOrder as FormElementOrList;
				return { ...state, formElements };
			}
			return { ...state, formElements: newOrder };
		});
	};

	const reorderSteps = (newOrder: FormStep[]): void => {
		store.setState((state) => ({ ...state, formElements: newOrder }));
	};
	const setTemplate: SetTemplate = (templateName: keyof typeof templates) => {
		const template = templates[templateName]?.template;
		if (!template) {
			throw new FormBuilderError(
				`Template '${templateName}' not found`,
				"TEMPLATE_NOT_FOUND",
			);
		}
		if (template.length === 0) {
			throw new FormBuilderError(
				`Template '${templateName}' is empty`,
				"EMPTY_TEMPLATE",
			);
		}
		const isTemplateMSForm = template.length > 0 && isFormStep(template[0]);
		store.setState((state) => ({
			...state,
			formElements: template,
			isMS: isTemplateMSForm,
		}));
	};
	const resetFormElements = () => {
		store.setState((state) => ({ ...state, formElements: [] }));
	};
	const setIsMS = (isMS: boolean) => {
		store.setState((state) => {
			let formElements = state.formElements;
			if (isMS) {
				formElements = transformToStepFormList(
					formElements as FormElementOrList[],
				);
			} else {
				formElements = flattenFormSteps(
					formElements as FormStep[],
				) as FormElementOrList[];
			}
			return { ...state, isMS, formElements };
		});
	};
	const addFormStep = (currentPosition?: number) => {
		store.setState((state) => {
			if (!state.isMS) {
				throw new FormBuilderError(
					"Cannot add form step to single-step form",
					"NOT_MULTI_STEP_FORM",
				);
			}
			const defaultStep: FormStep = { id: uuid(), stepFields: [] };
			const formSteps = state.formElements as FormStep[];
			if (typeof currentPosition === "number") {
				if (currentPosition < 0 || currentPosition >= formSteps.length) {
					throw new FormBuilderError(
						`Invalid position: ${currentPosition}. Must be between 0 and ${formSteps.length - 1}`,
						"INVALID_POSITION",
					);
				}
				const nextPosition = currentPosition + 1;
				const updatedSteps = insertAtIndex(
					formSteps,
					defaultStep,
					nextPosition,
				);
				return {
					...state,
					formElements: updatedSteps,
					lastAddedStepIndex: nextPosition,
				};
			}
			const newIndex = formSteps.length;
			return {
				...state,
				formElements: [...formSteps, defaultStep],
				lastAddedStepIndex: newIndex,
			};
		});
	};
	const removeFormStep = (stepIndex: number) => {
		store.setState((state) => {
			if (!state.isMS) {
				throw new FormBuilderError(
					"Cannot remove form step from single-step form",
					"NOT_MULTI_STEP_FORM",
				);
			}
			const formSteps = state.formElements as FormStep[];
			validateStepIndex(formSteps, stepIndex);
			if (formSteps.length <= 1) {
				throw new FormBuilderError(
					"Cannot remove the last step from a multi-step form",
					"CANNOT_REMOVE_LAST_STEP",
				);
			}
			const updatedSteps = dropAtIndex(formSteps, stepIndex);
			return { ...state, formElements: updatedSteps };
		});
	};
	const addFormArray = (arrayField: FormElementList, stepIndex?: number) => {
		store.setState((state) => {
			// Create default entry with all fields from template, preserving nested structure
			const defaultEntry: FormArrayEntry = {
				id: uuid(),
				fields: arrayField.map((field: FormElement | FormElement[]) => {
					if (Array.isArray(field)) {
						// Handle nested arrays
						return field.map((nestedField: FormElement) => ({
							...nestedField,
							id: uuid(),
							name: `${nestedField.name.replace(/-/g, "_")}_default_${Date.now()}`,
						}));
					}
					// Handle single fields
					return {
						...field,
						id: uuid(),
						name: `${field.name.replace(/-/g, "_")}_default_${Date.now()}`,
					};
				}),
			};

			const newFormArray: FormArray = {
				id: uuid(),
				fieldType: "FormArray",
				name: `formArray_${Date.now()}`,
				label: "Form Array",
				arrayField,
				entries: [defaultEntry], // Start with default entry
			};
			if (isFormArrayForm(state.formElements)) {
				return {
					...state,
					formElements: [...state.formElements, newFormArray],
				};
			}
			if (isMultiStepForm(state.formElements)) {
				// Add to the specified step or last added step or last step
				const formSteps = state.formElements as FormStep[];
				const targetStepIndex =
					stepIndex ?? state.lastAddedStepIndex ?? formSteps.length - 1;
				if (stepIndex !== undefined) {
					validateStepIndex(formSteps, targetStepIndex);
				}
				const step = formSteps[targetStepIndex];
				const stepFields = [...step.stepFields, newFormArray];
				const updatedSteps = formSteps.map((s, i) =>
					i === targetStepIndex ? { ...s, stepFields } : s,
				);
				return { ...state, formElements: updatedSteps };
			}
			// Add to FormElementList
			const currentElements = state.formElements as FormElementList;
			return {
				...state,
				formElements: [...currentElements, newFormArray] as any,
			};
		});
	};
	const removeFormArray = (id: string) => {
		store.setState((state) => {
			// Helper function to find and remove FormArray
			const findAndRemoveFormArray = (elements: any[]): any[] => {
				return elements.filter((el) => {
					if (typeof el === "object" && el !== null && "arrayField" in el) {
						return el.id !== id;
					}
					return true;
				});
			};

			// Check if there's a FormArray with the given id
			let hasFormArray = false;
			const checkForFormArray = (elements: any[]): boolean => {
				return elements.some((el) => {
					if (
						typeof el === "object" &&
						el !== null &&
						"arrayField" in el &&
						el.id === id
					) {
						return true;
					}
					return false;
				});
			};

			if (isFormArrayForm(state.formElements)) {
				hasFormArray = checkForFormArray(state.formElements);
			} else if (isMultiStepForm(state.formElements)) {
				const formSteps = state.formElements as FormStep[];
				hasFormArray = formSteps.some((step) =>
					checkForFormArray(step.stepFields),
				);
			} else {
				const currentElements = state.formElements as FormElementList;
				hasFormArray = checkForFormArray(currentElements);
			}

			if (!hasFormArray) {
				throw new FormBuilderError(
					"FormArray not found",
					"FORM_ARRAY_NOT_FOUND",
				);
			}

			let updatedElements: unknown;
			if (isFormArrayForm(state.formElements)) {
				updatedElements = findAndRemoveFormArray(state.formElements);
			} else if (isMultiStepForm(state.formElements)) {
				const formSteps = state.formElements as FormStep[];
				updatedElements = formSteps.map((step) => ({
					...step,
					stepFields: findAndRemoveFormArray(step.stepFields),
				}));
			} else {
				const currentElements = state.formElements as FormElementList;
				updatedElements = findAndRemoveFormArray(currentElements);
			}

			return { ...state, formElements: updatedElements as any };
		});
	};
	const updateFormArray = (id: string, arrayField: FormElementList) => {
		batch(() => {
			store.setState((state) => {
				// Helper function to find and update FormArray
				const findAndUpdateFormArray = (elements: any[]): any[] => {
					return elements.map((el) => {
						if (
							typeof el === "object" &&
							el !== null &&
							"arrayField" in el &&
							el.id === id
						) {
							return { ...el, arrayField };
						}
						return el;
					});
				};

				// Check if there's a FormArray with the given id
				let hasFormArray = false;
				const checkForFormArray = (elements: any[]): boolean => {
					return elements.some((el) => {
						if (
							typeof el === "object" &&
							el !== null &&
							"arrayField" in el &&
							el.id === id
						) {
							return true;
						}
						return false;
					});
				};

				if (isFormArrayForm(state.formElements)) {
					hasFormArray = checkForFormArray(state.formElements);
				} else if (isMultiStepForm(state.formElements)) {
					const formSteps = state.formElements as FormStep[];
					hasFormArray = formSteps.some((step) =>
						checkForFormArray(step.stepFields),
					);
				} else {
					const currentElements = state.formElements as FormElementList;
					hasFormArray = checkForFormArray(currentElements);
				}

				if (!hasFormArray) {
					throw new FormBuilderError(
						"FormArray not found",
						"FORM_ARRAY_NOT_FOUND",
					);
				}

				let updatedElements: unknown;
				if (isFormArrayForm(state.formElements)) {
					updatedElements = findAndUpdateFormArray(state.formElements);
				} else if (isMultiStepForm(state.formElements)) {
					const formSteps = state.formElements as FormStep[];
					updatedElements = formSteps.map((step) => ({
						...step,
						stepFields: findAndUpdateFormArray(step.stepFields),
					}));
				} else {
					const currentElements = state.formElements as FormElementList;
					updatedElements = findAndUpdateFormArray(currentElements);
				}

				return { ...state, formElements: updatedElements as any };
			});
			// Auto-sync entries when template changes
			syncFormArrayEntries(id);
		});
	};
	const updateFormArrayProperties = (
		id: string,
		properties: Partial<FormArray>,
	) => {
		store.setState((state) => {
			// Helper function to find and update FormArray
			const findAndUpdateFormArray = (elements: any[]): any[] => {
				return elements.map((el) => {
					if (
						typeof el === "object" &&
						el !== null &&
						"arrayField" in el &&
						el.id === id
					) {
						return { ...el, ...properties };
					}
					return el;
				});
			};

			let updatedElements: unknown;
			if (isFormArrayForm(state.formElements)) {
				updatedElements = findAndUpdateFormArray(state.formElements);
			} else if (isMultiStepForm(state.formElements)) {
				const formSteps = state.formElements as FormStep[];
				updatedElements = formSteps.map((step) => ({
					...step,
					stepFields: findAndUpdateFormArray(step.stepFields),
				}));
			} else {
				const currentElements = state.formElements as FormElementList;
				updatedElements = findAndUpdateFormArray(currentElements);
			}

			return { ...state, formElements: updatedElements as any };
		});
	};
	const reorderFormArray = (id: string, newOrder: FormElementList) => {
		store.setState((state) => {
			if (isFormArrayForm(state.formElements)) {
				const updated = state.formElements.map((arr) =>
					arr.id === id ? { ...arr, arrayField: newOrder } : arr,
				);
				return { ...state, formElements: updated };
			}
			if (isMultiStepForm(state.formElements)) {
				const formSteps = state.formElements as FormStep[];
				const updatedSteps = formSteps.map((step) => ({
					...step,
					stepFields: step.stepFields.map((el) =>
						typeof el === "object" &&
						el !== null &&
						"arrayField" in el &&
						(el as any).id === id
							? { ...el, arrayField: newOrder }
							: el,
					),
				}));
				return { ...state, formElements: updatedSteps };
			}
			throw new FormBuilderError(
				"Not in FormArray or MultiStep mode",
				"NOT_SUPPORTED_MODE",
			);
		});
	};

	const addFormArrayEntry = (arrayId: string) => {
		store.setState((state) => {
			const findAndUpdateFormArray = (elements: any[]): any[] => {
				return elements.map((el) => {
					if (
						typeof el === "object" &&
						el !== null &&
						"arrayField" in el &&
						el.id === arrayId
					) {
						// Create a new entry with unique field names, preserving nested structure
						const newEntry: FormArrayEntry = {
							id: uuid(),
							fields: el.arrayField.map((field: any) => {
								if (Array.isArray(field)) {
									// Handle nested arrays
									return field.map((nestedField: any) => ({
										...nestedField,
										id: uuid(),
										name: `${el?.name?.replace(/-/g, "_")}[${el.entries.length}].${nestedField.name.replace(/-/g, "_")}`,
									}));
								}
								// Handle single fields
								return {
									...field,
									id: uuid(),
									name: `${el?.name?.replace(/-/g, "_")}[${el.entries.length}].${field.name.replace(/-/g, "_")}`,
								};
							}),
						};
						return { ...el, entries: [...el.entries, newEntry] };
					}
					return el;
				});
			};

			if (isFormArrayForm(state.formElements)) {
				return {
					...state,
					formElements: findAndUpdateFormArray(state.formElements),
				};
			}
			if (isMultiStepForm(state.formElements)) {
				const formSteps = state.formElements as FormStep[];
				const updatedSteps = formSteps.map((step) => ({
					...step,
					stepFields: findAndUpdateFormArray(step.stepFields),
				}));
				return { ...state, formElements: updatedSteps };
			}
			const currentElements = state.formElements as FormElementList;
			return {
				...state,
				formElements: findAndUpdateFormArray(currentElements),
			};
		});
	};

	const removeFormArrayEntry = (arrayId: string, entryId: string) => {
		store.setState((state) => {
			// Find the FormArray to check if this is the first entry
			const flatElements = Array.isArray(state.formElements)
				? state.formElements
				: [state.formElements];
			const formArray = flatElements
				.flatMap((el: any) =>
					"arrayField" in el && el.id === arrayId ? [el] : [],
				)
				.find((arr: any) => arr.id === arrayId);

			if (
				formArray &&
				formArray.entries.length > 0 &&
				formArray.entries[0].id === entryId
			) {
				throw new FormBuilderError(
					"Cannot delete the first entry (default entry) from FormArray",
					"CANNOT_DELETE_FIRST_ENTRY",
				);
			}
			const findAndUpdateFormArray = (elements: any[]): any[] => {
				return elements.map((el) => {
					if (
						typeof el === "object" &&
						el !== null &&
						"arrayField" in el &&
						el.id === arrayId
					) {
						return {
							...el,
							entries: el.entries.filter(
								(entry: FormArrayEntry) => entry.id !== entryId,
							),
						};
					}
					return el;
				});
			};

			if (isFormArrayForm(state.formElements)) {
				return {
					...state,
					formElements: findAndUpdateFormArray(state.formElements),
				};
			}
			if (isMultiStepForm(state.formElements)) {
				const formSteps = state.formElements as FormStep[];
				const updatedSteps = formSteps.map((step) => ({
					...step,
					stepFields: findAndUpdateFormArray(step.stepFields),
				}));
				return { ...state, formElements: updatedSteps };
			}
			const currentElements = state.formElements as FormElementList;
			return {
				...state,
				formElements: findAndUpdateFormArray(currentElements),
			};
		});
	};

	const updateFormArrayEntry = (
		arrayId: string,
		entryId: string,
		fields: FormElementList,
	) => {
		store.setState((state) => {
			const findAndUpdateFormArray = (elements: any[]): any[] => {
				return elements.map((el) => {
					if (
						typeof el === "object" &&
						el !== null &&
						"arrayField" in el &&
						el.id === arrayId
					) {
						return {
							...el,
							entries: el.entries.map((entry: FormArrayEntry) =>
								entry.id === entryId ? { ...entry, fields } : entry,
							),
						};
					}
					return el;
				});
			};

			if (isFormArrayForm(state.formElements)) {
				return {
					...state,
					formElements: findAndUpdateFormArray(state.formElements),
				};
			}
			if (isMultiStepForm(state.formElements)) {
				const formSteps = state.formElements as FormStep[];
				const updatedSteps = formSteps.map((step) => ({
					...step,
					stepFields: findAndUpdateFormArray(step.stepFields),
				}));
				return { ...state, formElements: updatedSteps };
			}
			const currentElements = state.formElements as FormElementList;
			return {
				...state,
				formElements: findAndUpdateFormArray(currentElements),
			};
		});
	};

	const removeFormArrayField = (arrayId: string, fieldIndex: number) => {
		batch(() => {
			store.setState((state) => {
				const findAndUpdateFormArray = (elements: any[]): any[] => {
					return elements.map((el) => {
						if (
							typeof el === "object" &&
							el !== null &&
							"arrayField" in el &&
							el.id === arrayId
						) {
							const updatedArrayField = el.arrayField.filter(
								(_: any, index: number) => index !== fieldIndex,
							);
							return { ...el, arrayField: updatedArrayField };
						}
						return el;
					});
				};

				if (isFormArrayForm(state.formElements)) {
					return {
						...state,
						formElements: findAndUpdateFormArray(state.formElements),
					};
				}
				if (isMultiStepForm(state.formElements)) {
					const formSteps = state.formElements as FormStep[];
					const updatedSteps = formSteps.map((step) => ({
						...step,
						stepFields: findAndUpdateFormArray(step.stepFields),
					}));
					return { ...state, formElements: updatedSteps };
				}
				const currentElements = state.formElements as FormElementList;
				return {
					...state,
					formElements: findAndUpdateFormArray(currentElements),
				};
			});
			// Sync entries after template update
			syncFormArrayEntries(arrayId);
		});
	};

	const updateFormArrayField = (
		arrayId: string,
		fieldIndex: number,
		updatedField: FormElement,
		nestedIndex?: number,
		updateTemplate = true,
	) => {
		const updateFunction = updateTemplate ? batch : (fn: () => void) => fn();

		updateFunction(() => {
			store.setState((state) => {
				const findAndUpdateFormArray = (elements: any[]): any[] => {
					return elements.map((el) => {
						if (
							typeof el === "object" &&
							el !== null &&
							"arrayField" in el &&
							el.id === arrayId
						) {
							const updatedElement = { ...el };

							// Always update template for property changes
							const updatedArrayField = [...el.arrayField];
							if (nestedIndex !== undefined) {
								// Update nested field in template
								const currentField = updatedArrayField[fieldIndex];
								if (Array.isArray(currentField)) {
									const updatedNested = currentField.map(
										(nestedField: any, j: number) =>
											j === nestedIndex
												? { ...nestedField, ...updatedField }
												: nestedField,
									);
									updatedArrayField[fieldIndex] = updatedNested;
								} else {
									// If not array, treat as single field update
									updatedArrayField[fieldIndex] = {
										...currentField,
										...updatedField,
									};
								}
							} else {
								// Update top-level field in template
								updatedArrayField[fieldIndex] = {
									...updatedArrayField[fieldIndex],
									...updatedField,
								};
							}
							updatedElement.arrayField = updatedArrayField;

							// Always update entries
							const updatedEntries = el.entries.map((entry: any) => {
								const updatedFields = [...entry.fields];
								const currentField = updatedFields[fieldIndex];

								if (nestedIndex !== undefined) {
									// Update specific nested field in entry
									if (Array.isArray(currentField)) {
										updatedFields[fieldIndex] = currentField.map(
											(nestedField: any, j: number) =>
												j === nestedIndex
													? { ...nestedField, ...updatedField }
													: nestedField,
										);
									} else {
										// If not array, treat as single field update
										updatedFields[fieldIndex] = {
											...currentField,
											...updatedField,
										};
									}
								} else {
									// Update single field only (not arrays without nestedIndex)
									if (!Array.isArray(currentField)) {
										updatedFields[fieldIndex] = {
											...currentField,
											...updatedField,
										};
									} else {
									}
								}

								return { ...entry, fields: updatedFields };
							});

							updatedElement.entries = updatedEntries;
							return updatedElement;
						}
						return el;
					});
				};

				if (isFormArrayForm(state.formElements)) {
					return {
						...state,
						formElements: findAndUpdateFormArray(state.formElements),
					};
				}
				if (isMultiStepForm(state.formElements)) {
					const formSteps = state.formElements as FormStep[];
					const updatedSteps = formSteps.map((step) => ({
						...step,
						stepFields: findAndUpdateFormArray(step.stepFields),
					}));
					return { ...state, formElements: updatedSteps };
				}
				const currentElements = state.formElements as FormElementList;
				return {
					...state,
					formElements: findAndUpdateFormArray(currentElements),
				};
			});

			// Only sync entries if we updated the template
			if (updateTemplate) {
				syncFormArrayEntries(arrayId);
			}
		});
	};

	const addFormArrayField = (
		arrayId: string,
		fieldType: FormElement["fieldType"],
	) => {
		validateFieldType(fieldType);
		batch(() => {
			store.setState((state) => {
				const newFormElement = {
					id: uuid(),
					...defaultFormElements[fieldType],
					content: defaultFormElements[fieldType].content,
					label:
						(defaultFormElements[fieldType] as any).label ||
						defaultFormElements[fieldType].content,
					name: `${fieldType}_${Date.now()}`.replace(/-/g, "_"),
					required: true,
					fieldType,
				} as FormElement;

				const findAndUpdateFormArray = (elements: any[]): any[] => {
					return elements.map((el) => {
						if (
							typeof el === "object" &&
							el !== null &&
							"arrayField" in el &&
							el.id === arrayId
						) {
							// Add new field at the end
							const updatedArrayField = [...el.arrayField, newFormElement];
							return { ...el, arrayField: updatedArrayField };
						}
						return el;
					});
				};

				if (isFormArrayForm(state.formElements)) {
					return {
						...state,
						formElements: findAndUpdateFormArray(state.formElements),
					};
				}
				if (isMultiStepForm(state.formElements)) {
					const formSteps = state.formElements as FormStep[];
					const updatedSteps = formSteps.map((step) => ({
						...step,
						stepFields: findAndUpdateFormArray(step.stepFields),
					}));
					return { ...state, formElements: updatedSteps };
				}
				const currentElements = state.formElements as FormElementList;
				return {
					...state,
					formElements: findAndUpdateFormArray(currentElements),
				};
			});
			// Sync entries after adding field (but don't auto-create new entry)
			syncFormArrayEntries(arrayId);
		});
	};

	const reorderFormArrayFields = (
		arrayId: string,
		newOrder: FormElementList,
	) => {
		batch(() => {
			store.setState((state) => {
				const findAndUpdateFormArray = (elements: any[]): any[] => {
					return elements.map((el) => {
						if (
							typeof el === "object" &&
							el !== null &&
							"arrayField" in el &&
							el.id === arrayId
						) {
							return { ...el, arrayField: newOrder };
						}
						return el;
					});
				};

				if (isFormArrayForm(state.formElements)) {
					return {
						...state,
						formElements: findAndUpdateFormArray(state.formElements),
					};
				}
				if (isMultiStepForm(state.formElements)) {
					const formSteps = state.formElements as FormStep[];
					const updatedSteps = formSteps.map((step) => ({
						...step,
						stepFields: findAndUpdateFormArray(step.stepFields),
					}));
					return { ...state, formElements: updatedSteps };
				}
				const currentElements = state.formElements as FormElementList;
				return {
					...state,
					formElements: findAndUpdateFormArray(currentElements),
				};
			});
			// Sync entries after reordering
			syncFormArrayEntries(arrayId);
		});
	};

	const syncFormArrayEntries = (arrayId: string) => {
		store.setState((state) => {
			const findAndSyncFormArray = (elements: any[]): any[] => {
				return elements.map((el) => {
					if (
						typeof el === "object" &&
						el !== null &&
						"arrayField" in el &&
						el.id === arrayId
					) {
						// Update all existing entries to match the current template
						const syncedEntries = syncEntriesForFormArray(el);
						return { ...el, entries: syncedEntries };
					}
					return el;
				});
			};

			if (isFormArrayForm(state.formElements)) {
				return {
					...state,
					formElements: findAndSyncFormArray(state.formElements),
				};
			}
			if (isMultiStepForm(state.formElements)) {
				const formSteps = state.formElements as FormStep[];
				const updatedSteps = formSteps.map((step) => ({
					...step,
					stepFields: findAndSyncFormArray(step.stepFields),
				}));
				return { ...state, formElements: updatedSteps };
			}
			const currentElements = state.formElements as FormElementList;
			return {
				...state,
				formElements: findAndSyncFormArray(currentElements),
			};
		});
	};

	const setFormName = (formName: string) => {
		store.setState((state) => ({ ...state, formName }));
	};
	const setSchemaName = (schemaName: string) => {
		store.setState((state) => ({ ...state, schemaName }));
	};
	const setValidationSchema = (validationSchema: ValidationSchema) => {
		store.setState((state) => ({ ...state, validationSchema }));
	};
	const setFramework = (framework: Framework) => {
		store.setState((state) => ({ ...state, framework }));
	};
	const setFormElements = (formElements: FormElements) => {
		const isMS = isMultiStepForm(formElements);
		store.setState((state) => ({ ...state, formElements, isMS }));
	};

	// Save/Load functions
	const saveForm = (formName: string) => {
		if (typeof window === "undefined") return;

		const state = store.state;
		const formData = {
			name: formName,
			data: {
				isMS: state.isMS,
				formElements: state.formElements,
				formName: state.formName,
				schemaName: state.schemaName,
				validationSchema: state.validationSchema,
				framework: state.framework,
			},
			createdAt: new Date().toISOString(),
		};

		try {
			const savedForms = JSON.parse(localStorage.getItem("savedForms") || "[]");
			const existingIndex = savedForms.findIndex(
				(form: any) => form.name === formName,
			);

			if (existingIndex !== -1) {
				savedForms[existingIndex] = formData;
			} else {
				savedForms.push(formData);
			}

			localStorage.setItem("savedForms", JSON.stringify(savedForms));
		} catch (error) {
			console.error("Failed to save form:", error);
		}
	};

	const loadForm = (formName: string): boolean => {
		if (typeof window === "undefined") return false;

		try {
			const savedForms = JSON.parse(localStorage.getItem("savedForms") || "[]");
			const formData = savedForms.find((form: any) => form.name === formName);

			if (formData) {
				const { data } = formData;
				store.setState({
					isMS: data.isMS,
					formElements: data.formElements,
					formName: data.formName || formName,
					schemaName: data.schemaName,
					validationSchema: data.validationSchema,
					framework: data.framework,
				});
				return true;
			}
			return false;
		} catch (error) {
			console.error("Failed to load form:", error);
			return false;
		}
	};

	const getSavedForms = (): Array<{
		name: string;
		data: Record<string, unknown>;
		createdAt: string;
	}> => {
		if (typeof window === "undefined") return [];

		try {
			return JSON.parse(localStorage.getItem("savedForms") || "[]");
		} catch (error) {
			console.error("Failed to get saved forms:", error);
			return [];
		}
	};

	const deleteSavedForm = (formName: string): boolean => {
		if (typeof window === "undefined") return false;

		try {
			const savedForms = JSON.parse(localStorage.getItem("savedForms") || "[]");
			const filteredForms = savedForms.filter(
				(form: any) => form.name !== formName,
			);
			localStorage.setItem("savedForms", JSON.stringify(filteredForms));
			return true;
		} catch (error) {
			console.error("Failed to delete saved form:", error);
			return false;
		}
	};

	const batchAppendElements = (elements: Array<FormElementOrList>) => {
		batch(() => {
			for (const element of elements) {
				try {
					if (Array.isArray(element)) {
						for (let i = 0; i < element.length; i++) {
							const el = element[i];
							if (i === 0) {
								appendElement(el as FormElement);
							} else {
								// Case where we have a nested array
								appendElement({
									fieldIndex: i + 1,
									stepIndex: 0,
									...el,
								});
							}
						}
					} else {
						appendElement(element as FormElement);
					}
				} catch (error) {
					console.error(
						`Failed to append element of type ${(element as object)?.fieldType}:`,
						error,
					);
					throw error;
				}
			}
		});
	};
	const batchEditElements = (
		edits: Array<{
			fieldIndex: number;
			j?: number;
			stepIndex?: number;
			modifiedFormElement: any;
		}>,
	) => {
		batch(() => {
			for (const { fieldIndex, j, stepIndex, modifiedFormElement } of edits) {
				try {
					editElement({ fieldIndex, j, stepIndex, modifiedFormElement });
				} catch (error) {
					console.error(
						`Failed to edit element at index ${fieldIndex}:`,
						error,
					);
					throw error;
				}
			}
		});
	};
	return {
		appendElement,
		dropElement,
		editElement,
		reorder,
		reorderSteps,
		setTemplate,
		resetFormElements,
		setIsMS,
		addFormStep,
		removeFormStep,
		addFormArray,
		removeFormArray,
		updateFormArray,
		updateFormArrayProperties,
		reorderFormArray,
		addFormArrayEntry,
		removeFormArrayEntry,
		updateFormArrayEntry,
		removeFormArrayField,
		updateFormArrayField,
		addFormArrayField,
		reorderFormArrayFields,
		syncFormArrayEntries,
		batchAppendElements,
		batchEditElements,
		setFormName,
		setSchemaName,
		setValidationSchema,
		setFramework,
		setFormElements,
		saveForm,
		loadForm,
		getSavedForms,
		deleteSavedForm,
	};
};
const formBuilderActions = createActions(formBuilderCoreStore);

const flattenedFormElementsStore = new Derived({
	fn: ({ currDepVals }) => {
		const [state] = currDepVals;
		if (isFormArrayForm(state.formElements)) {
			return state.formElements.flatMap((arr) => arr.arrayField);
		}
		if (state.isMS) {
			return flattenFormSteps(state.formElements as FormStep[]);
		}
		// Handle FormElementList that may contain FormArray
		const elements = state.formElements as FormElementList;
		return elements.flatMap((el) => {
			if (isFormArray(el)) {
				return el.arrayField;
			}
			if (Array.isArray(el)) {
				return el;
			}
			return [el];
		});
	},
	deps: [formBuilderCoreStore],
});
const formValidationStore = new Derived({
	fn: ({ currDepVals }) => {
		const [state] = currDepVals;
		const elements = isFormArrayForm(state.formElements)
			? state.formElements.flatMap((arr) => arr.arrayField)
			: state.isMS
				? flattenFormSteps(state.formElements as FormStep[])
				: (() => {
						// Handle FormElementList that may contain FormArray
						const elems = state.formElements as FormElementList;
						return elems.flatMap((el) => {
							if (isFormArray(el)) {
								return el.arrayField;
							}
							if (Array.isArray(el)) {
								return el;
							}
							return [el];
						});
					})();
		const hasRequiredFields = elements.some(
			(el) => !Array.isArray(el) && "required" in el && el.required,
		);
		const totalFields = elements.filter((el) => !Array.isArray(el)).length;
		return {
			hasRequiredFields,
			totalFields,
			isValid: totalFields > 0,
		};
	},
	deps: [formBuilderCoreStore],
});
const unmountFlattened = flattenedFormElementsStore.mount();
const unmountValidation = formValidationStore.mount();
const batchOperations = (operations: Array<() => void>) => {
	batch(() => {
		for (let i = 0; i < operations.length; i++) {
			operations[i]();
		}
	});
};
const createStoreSubscriptions = () => {
	const subscriptions = new Set<() => void>();
	const subscribeToFormChanges = (
		callback: (state: FormBuilderCoreState) => void,
	) => {
		const unsubscribe = formBuilderCoreStore.subscribe(() => {
			callback(formBuilderCoreStore.state);
		});
		subscriptions.add(unsubscribe);
		return unsubscribe;
	};
	const subscribeToValidationChanges = (
		callback: (validation: any) => void,
	) => {
		const unsubscribe = formValidationStore.subscribe(() => {
			callback(formValidationStore.state);
		});
		subscriptions.add(unsubscribe);
		return unsubscribe;
	};
	const unsubscribeAll = () => {
		for (const unsub of subscriptions) {
			unsub();
		}
		subscriptions.clear();
	};
	return {
		subscribeToFormChanges,
		subscribeToValidationChanges,
		unsubscribeAll,
	};
};
const batchFormOperations = {
	setTemplateAndAddElements: (
		templateName: keyof typeof templates,
		additionalElements: Array<{
			fieldType: keyof typeof defaultFormElements;
			stepIndex?: number;
		}>,
	) => {
		batch(() => {
			formBuilderActions.setTemplate(templateName);
			for (let i = 0; i < additionalElements.length; i++) {
				formBuilderActions.appendElement(additionalElements[i]);
			}
		});
	},
	convertToMultiStepAndAddSteps: (stepCount: number) => {
		batch(() => {
			formBuilderActions.setIsMS(true);
			for (let i = 1; i < stepCount; i++) {
				formBuilderActions.addFormStep();
			}
		});
	},
	bulkElementOperations: (
		operations: Array<
			| { type: "append"; options: Parameters<AppendElement>[0] }
			| { type: "edit"; options: Parameters<EditElement>[0] }
			| { type: "drop"; options: Parameters<DropElement>[0] }
		>,
	) => {
		batch(() => {
			for (const { type, options } of operations) {
				try {
					switch (type) {
						case "append":
							formBuilderActions.appendElement(options);
							break;
						case "edit":
							formBuilderActions.editElement(options);
							break;
						case "drop":
							formBuilderActions.dropElement(options);
							break;
					}
				} catch (error) {
					console.error(`Batch operation failed for ${type}:`, error);
					throw error;
				}
			}
		});
	},
};
export const useFormStore = () => {
	const coreState = useStore(formBuilderCoreStore);
	const flattenedElements = useStore(flattenedFormElementsStore);
	const validation = useStore(formValidationStore);
	return {
		// Core state (read-only)
		isMS: coreState.isMS,
		formElements: coreState.formElements,
		formName: coreState.formName,
		schemaName: coreState.schemaName,
		validationSchema: coreState.validationSchema,
		framework: coreState.framework,
		// Actions (write operations)
		actions: formBuilderActions,
		// Computed values (derived state)
		computed: {
			flattenedElements,
			validation,
		},
		// Batch operations utilities
		batch: {
			operations: batchOperations,
			formOperations: batchFormOperations,
		},
		subscriptions: createStoreSubscriptions(),
		errors: {
			FormBuilderError,
		},
		// Direct store access for advanced usage
		stores: {
			core: formBuilderCoreStore,
			flattened: flattenedFormElementsStore,
			validation: formValidationStore,
		},
	};
};
export const formBuilderCoreStoreInstance = formBuilderCoreStore;
export const flattenedFormElementsStoreInstance = flattenedFormElementsStore;
export const formValidationStoreInstance = formValidationStore;
// Cleanup function for unmounting derived stores
export const cleanupFormBuilderStore = () => {
	unmountFlattened();
	unmountValidation();
};
export { FormBuilderError };
export const createFormBuilderSelector = <T>(
	selector: (state: FormBuilderCoreState) => T,
) => {
	return () => useStore(formBuilderCoreStore, selector);
};
export const useFormElementsOnly = createFormBuilderSelector(
	(state) => state.formElements,
);
export const useIsMultiStep = createFormBuilderSelector((state) => state.isMS);
export const useFormElementCount = createFormBuilderSelector((state) => {
	if (state.isMS) {
		return (state.formElements as FormStep[]).reduce(
			(total, step) => total + step.stepFields.length,
			0,
		);
	}
	return (state.formElements as FormElementList).length;
});
// Performance-optimized selectors using shallow comparison
export const useFormElementsShallow = () =>
	useStore(formBuilderCoreStore, (state) => state.formElements);
export const useFormStepsShallow = () =>
	useStore(formBuilderCoreStore, (state) =>
		state.isMS ? (state.formElements as FormStep[]) : [],
	);
// Example usage documentation
/*Usage Examples:
  1. Basic usage:   const { isMS, formElements, actions, computed } = useFormBuilderStoreTanStack();
  2. Performance - optimized with selectors: const formElements = useFormElementsOnly(); const isMultiStep = useIsMultiStep();
  3. Batch operations:   const { batch } = useFormBuilderStoreTanStack(); batch.formOperations.setTemplateAndAddElements('contactUs', [{ fieldType: 'Input' }, { fieldType: 'Textarea' }]);
  4. Direct store subscription:   const { subscriptions } = useFormBuilderStoreTanStack(); const unsubscribe = subscriptions.subscribeToFormChanges((state) => { console.log('Form changed:', state); });
  5. Error try { actions.appendElement({ fieldType: 'InvalidType' }); } catch(error) { if (error instanceof FormBuilderError) { console.error('Form builder error:', error.code, error.message); } };
  */
