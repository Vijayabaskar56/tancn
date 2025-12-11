import { createIsomorphicFn } from "@tanstack/react-start";
import { v4 as uuid } from "uuid";
import { defaultFormElements } from "@/constants/default-form-element";
import { templates } from "@/constants/templates";
import {
  type FormArray,
  type FormArrayEntry,
  type FormBuilder,
  type FormBuilderSettings,
  type FormElement,
  type FormElementList,
  type FormElements,
  type FormStep,
  type SavedFormTemplate,
  formBuilderCollection,
} from "@/db-collections/form-builder.collections";
import {
  dropAtIndex,
  flattenFormSteps,
  insertAtIndex,
  transformToStepFormList,
} from "@/lib/form-elements-helpers";
import type {
  AppendElement,
  DropElement,
  EditElement,
  FormElementOrList,
  ReorderElements,
  SetTemplate,
} from "@/types/form-types";

const FORM_ID = 1;

// ============================================================================
// Default Values
// ============================================================================

const DEFAULT_FORM_SETTINGS: FormBuilderSettings = {
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
};

const DEFAULT_FORM_ELEMENTS = templates.contactUs.template as FormElementOrList[];

// ============================================================================
// Type Guards
// ============================================================================

const isFormStep = (
  element: FormElementOrList | FormStep | FormElements,
): element is FormStep => {
  return (
    typeof element === "object" &&
    element !== null &&
    !Array.isArray(element) &&
    "stepFields" in element &&
    Array.isArray(element.stepFields)
  );
};

const isMultiStepForm = (
  formElements: FormElements,
): formElements is FormStep[] => {
  return Array.isArray(formElements) && formElements.length > 0 && isFormStep(formElements[0]);
};

const isFormArray = (
  element: unknown,
): element is FormArray => {
  return (
    typeof element === "object" &&
    element !== null &&
    !Array.isArray(element) &&
    "arrayField" in element &&
    "fieldType" in element &&
    (element as FormArray).fieldType === "FormArray"
  );
};

const isFormArrayForm = (
  formElements: FormElements,
): formElements is FormArray[] => {
  return Array.isArray(formElements) && formElements.length > 0 && isFormArray(formElements[0]);
};

// ============================================================================
// Error Handling
// ============================================================================

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

// ============================================================================
// Helper Functions
// ============================================================================

const syncEntriesForFormArray = (formArray: FormArray): FormArrayEntry[] => {
  return formArray.entries.map((entry: FormArrayEntry, entryIndex: number) => {
    const syncedFields = formArray.arrayField.map(
      (templateField: FormElement | FormElement[], index: number) => {
        if (Array.isArray(templateField)) {
          // Handle nested arrays
          if (Array.isArray(entry.fields[index])) {
            return templateField.map(
              (nestedTemplate: FormElement, nestedIndex: number) => {
                const existingNested = (entry.fields[index] as FormElement[])[
                  nestedIndex
                ];
                if (
                  existingNested &&
                  !Array.isArray(existingNested) &&
                  existingNested.fieldType === nestedTemplate.fieldType
                ) {
                  const { id: _id, name: _name, ...existingAttrs } = existingNested;
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
          return templateField.map((nestedTemplate: FormElement) => ({
            ...nestedTemplate,
            id: uuid(),
            name: `${formArray.name.replace(/-/g, "_")}[${entryIndex}].${nestedTemplate.name.replace(/-/g, "_")}`,
          }));
        }
        // Handle single fields
        if (
          entry.fields[index] &&
          !Array.isArray(entry.fields[index]) &&
          (entry.fields[index] as FormElement).fieldType ===
          templateField.fieldType
        ) {
          const existing = entry.fields[index] as FormElement;
          const { id: _id, name: _name, ...existingAttrs } = existing;
          return {
            ...templateField,
            ...existingAttrs,
            id: existing.id,
            name: `${formArray.name.replace(/-/g, "_")}[${entryIndex}].${templateField.name.replace(/-/g, "_")}`,
          };
        }
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

// ============================================================================
// Query Operations
// ============================================================================

/**
 * Get the current form data and settings
 */
export const getFormData = (): FormBuilder | null => {
  try {
    return formBuilderCollection.get(FORM_ID) || null;
  } catch (error) {
    console.error("Failed to get form data:", error);
    return null;
  }
};

/**
 * Get form settings only
 */
export const getSettings = (): FormBuilderSettings | null => {
  try {
    const data = getFormData();
    return data?.settings || null;
  } catch (error) {
    console.error("Failed to get form settings:", error);
    return null;
  }
};

/**
 * Get form elements only
 */
export const getFormElements = (): FormElements => {
  try {
    const data = getFormData();
    return data?.formElements || [];
  } catch (error) {
    console.error("Failed to get form elements:", error);
    return [];
  }
};

/**
 * Get form name
 */
export const getFormName = (): string => {
  try {
    const data = getFormData();
    return data?.formName || "draft";
  } catch (error) {
    console.error("Failed to get form name:", error);
    return "draft";
  }
};

/**
 * Check if form is multi-step
 */
export const getIsMultiStep = (): boolean => {
  try {
    const data = getFormData();
    return data?.isMS || false;
  } catch (error) {
    console.error("Failed to get isMS:", error);
    return false;
  }
};

// ============================================================================
// Settings Operations
// ============================================================================

/**
 * Update a single setting
 */
export const updateSetting = <K extends keyof FormBuilderSettings>(
  key: K,
  value: FormBuilderSettings[K],
): boolean => {
  try {
    formBuilderCollection.update(FORM_ID, (draft) => {
      if (!draft.settings) {
        draft.settings = DEFAULT_FORM_SETTINGS;
      }
      draft.settings[key] = value;
    });
    return true;
  } catch (error) {
    console.error(`Failed to update setting ${key}:`, error);
    return false;
  }
};

/**
 * Update multiple settings at once
 */
export const updateSettings = (
  settings: Partial<FormBuilderSettings>,
): boolean => {
  try {
    formBuilderCollection.update(FORM_ID, (draft) => {
      if (!draft.settings) {
        draft.settings = DEFAULT_FORM_SETTINGS;
      }
      Object.assign(draft.settings, settings);
    });
    return true;
  } catch (error) {
    console.error("Failed to update settings:", error);
    return false;
  }
};

/**
 * Reset settings to defaults
 */
export const resetSettings = (): boolean => {
  try {
    return updateSettings(DEFAULT_FORM_SETTINGS);
  } catch (error) {
    console.error("Failed to reset settings:", error);
    return false;
  }
};

/**
 * Set active tab
 */
export const setActiveTab = (
  tab: FormBuilderSettings["activeTab"],
): boolean => {
  return updateSetting("activeTab", tab);
};

/**
 * Set preferred framework
 */
export const setPreferredFramework = (
  framework: FormBuilderSettings["preferredFramework"],
): boolean => {
  return updateSetting("preferredFramework", framework);
};

/**
 * Set preferred schema
 */
export const setPreferredSchema = (
  schema: FormBuilderSettings["preferredSchema"],
): boolean => {
  return updateSetting("preferredSchema", schema);
};

/**
 * Set preferred package manager
 */
export const setPreferredPackageManager = (
  manager: FormBuilderSettings["preferredPackageManager"],
): boolean => {
  return updateSetting("preferredPackageManager", manager);
};

/**
 * Set code sidebar open state
 */
export const setCodeSidebarOpen = (open: boolean): boolean => {
  return updateSetting("isCodeSidebarOpen", open);
};

/**
 * Update multiple validation-related settings at once
 */
export const setValidationSettings = (settings: Partial<FormBuilderSettings>): boolean => {
  return updateSettings(settings);
};

// ============================================================================
// Form Metadata Operations
// ============================================================================

/**
 * Set form name
 */
export const setFormName = (name: string): boolean => {
  try {
    formBuilderCollection.update(FORM_ID, (draft) => {
      draft.formName = name;
    });
    return true;
  } catch (error) {
    console.error("Failed to set form name:", error);
    return false;
  }
};

/**
 * Set schema name
 */
export const setSchemaName = (name: string): boolean => {
  try {
    formBuilderCollection.update(FORM_ID, (draft) => {
      draft.schemaName = name;
    });
    return true;
  } catch (error) {
    console.error("Failed to set schema name:", error);
    return false;
  }
};

/**
 * Set multi-step mode
 */
export const setIsMS = (isMS: boolean): boolean => {
  try {
    formBuilderCollection.update(FORM_ID, (draft) => {
      let formElements = draft.formElements || [];
      if (isMS) {
        formElements = transformToStepFormList(formElements);
      } else {
        formElements = flattenFormSteps(formElements);
      }
      draft.isMS = isMS;
      draft.formElements = formElements;
    });
    return true;
  } catch (error) {
    console.error("Failed to set isMS:", error);
    return false;
  }
};

/**
 * Set form elements directly
 */
export const setFormElements = (formElements: FormElements): boolean => {
  try {
    const isMS = isMultiStepForm(formElements);
    formBuilderCollection.update(FORM_ID, (draft) => {
      draft.formElements = formElements;
      draft.isMS = isMS;
    });
    return true;
  } catch (error) {
    console.error("Failed to set form elements:", error);
    return false;
  }
};

// ============================================================================
// Form Element CRUD Operations
// ============================================================================

/**
 * Append a new element to the form
 */
export const appendElement: AppendElement = (options) => {
  const { fieldIndex, fieldType, id, name, content, j, ...rest } =
    options || { fieldIndex: null };
  validateFieldType(fieldType);

  try {
    formBuilderCollection.update(FORM_ID, (draft) => {
      const newFormElement = {
        id: id || uuid(),
        ...defaultFormElements[fieldType],
        content: content || defaultFormElements[fieldType].content,
        label: content || (defaultFormElements[fieldType] as FormElement).label,
        name: name || `${fieldType}_${Date.now()}`,
        required: true,
        fieldType,
        ...rest,
      }

      if (draft.isMS) {
        const stepIndex = options?.stepIndex ?? 0;
        const formSteps = draft.formElements as FormStep[];
        validateStepIndex(formSteps, stepIndex);
        const step = formSteps[stepIndex];

        if (typeof fieldIndex === "number") {
          validateFieldIndex(step.stepFields, fieldIndex);
          const existingElement = step.stepFields[fieldIndex];

          if (j !== undefined && isFormArray(existingElement)) {
            const formArray = existingElement;
            const existingField = formArray.arrayField[j];
            if (Array.isArray(existingField)) {
              formArray.arrayField[j] = [...existingField, newFormElement];
            } else {
              formArray.arrayField[j] = [existingField, newFormElement];
            }
            formArray.entries = syncEntriesForFormArray(formArray);
          } else if (Array.isArray(existingElement)) {
            step.stepFields[fieldIndex] = [...existingElement, newFormElement];
          } else {
            step.stepFields[fieldIndex] = [existingElement, newFormElement];
          }
        } else {
          step.stepFields.push(newFormElement);
        }
      } else {
        const formElements = draft.formElements as FormElementList;
        if (typeof fieldIndex === "number") {
          const existingElement = formElements[fieldIndex];
          if (j !== undefined && isFormArray(existingElement)) {
            const formArray = existingElement;
            const existingField = formArray.arrayField[j];
            if (Array.isArray(existingField)) {
              formArray.arrayField[j] = [...existingField, newFormElement];
            } else {
              formArray.arrayField[j] = [existingField, newFormElement];
            }
            formArray.entries = syncEntriesForFormArray(formArray);
          } else if (Array.isArray(existingElement)) {
            formElements[fieldIndex] = [...existingElement, newFormElement];
          } else {
            formElements[fieldIndex] = [existingElement, newFormElement];
          }
        } else {
          formElements.push(newFormElement);
        }
      }
    });
  } catch (error) {
    console.error("Failed to append element:", error);
    throw error;
  }
};

/**
 * Drop (remove) an element from the form
 */
export const dropElement: DropElement = (options) => {
  const { j, fieldIndex } = options;

  try {
    formBuilderCollection.update(FORM_ID, (draft) => {
      if (draft.isMS) {
        const stepIndex = options?.stepIndex ?? 0;
        const formSteps = draft.formElements as FormStep[];
        validateStepIndex(formSteps, stepIndex);
        const step = formSteps[stepIndex];

        if (typeof j === "number") {
          validateFieldIndex(step.stepFields, fieldIndex);
          const existingElement = step.stepFields[fieldIndex];
          if (Array.isArray(existingElement)) {
            if (j < 0 || j >= existingElement.length) {
              throw new FormBuilderError(
                `Invalid nested index: ${j}`,
                "INVALID_NESTED_INDEX",
              );
            }
            const [updatedArray] = dropAtIndex(existingElement, j);
            step.stepFields[fieldIndex] =
              updatedArray.length === 1 ? updatedArray[0] : updatedArray;
          }
        } else {
          validateFieldIndex(step.stepFields, fieldIndex);
          const updatedFields = dropAtIndex(step.stepFields, fieldIndex);
          step.stepFields.splice(0, step.stepFields.length, ...updatedFields);
        }
      } else {
        const formElements = draft.formElements as FormElementList;
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
            formElements[fieldIndex] =
              updatedArray.length === 1 ? updatedArray[0] : updatedArray;
          }
        } else {
          validateFieldIndex(formElements, fieldIndex);
          const updatedElements = dropAtIndex(formElements, fieldIndex);
          draft.formElements = updatedElements;
        }
      }
    });
  } catch (error) {
    console.error("Failed to drop element:", error);
    throw error;
  }
};

/**
 * Edit an existing element
 */
export const editElement: EditElement = (options) => {
  const { j, fieldIndex, modifiedFormElement } = options;

  try {
    formBuilderCollection.update(FORM_ID, (draft) => {
      if (draft.isMS) {
        const stepIndex = options.stepIndex ?? 0;
        const formSteps = draft.formElements as FormStep[];
        validateStepIndex(formSteps, stepIndex);
        const step = formSteps[stepIndex];
        validateFieldIndex(step.stepFields, fieldIndex);
        const currentElement = step.stepFields[fieldIndex];

        if (typeof j === "number" && Array.isArray(currentElement)) {
          if (j < 0 || j >= currentElement.length) {
            throw new FormBuilderError(
              `Invalid nested index: ${j}`,
              "INVALID_NESTED_INDEX",
            );
          }
          currentElement[j] = {
            ...currentElement[j],
            ...modifiedFormElement,
          };
        } else {
          step.stepFields[fieldIndex] = {
            ...currentElement,
            ...modifiedFormElement,
          };
        }
      } else {
        const formElements = draft.formElements as FormElementList;
        validateFieldIndex(formElements, fieldIndex);

        if (typeof j === "number" && Array.isArray(formElements[fieldIndex])) {
          const currentElement = formElements[fieldIndex]
          if (j < 0 || j >= currentElement.length) {
            throw new FormBuilderError(
              `Invalid nested index: ${j}`,
              "INVALID_NESTED_INDEX",
            );
          }
          currentElement[j] = {
            ...currentElement[j],
            ...modifiedFormElement,
          }
        } else {
          formElements[fieldIndex] = {
            ...formElements[fieldIndex],
            ...modifiedFormElement,
          }
        }
      }
    });
  } catch (error) {
    console.error("Failed to edit element:", error);
    throw error;
  }
};

/**
 * Reorder form elements
 */
export const reorder: ReorderElements = (options) => {
  const { newOrder, fieldIndex } = options;

  try {
    formBuilderCollection.update(FORM_ID, (draft) => {
      if (draft.isMS) {
        const stepIndex = options.stepIndex ?? 0;
        const formSteps = draft.formElements as FormStep[];
        validateStepIndex(formSteps, stepIndex);
        const step = formSteps[stepIndex];

        if (typeof fieldIndex === "number") {
          validateFieldIndex(step.stepFields, fieldIndex);
          step.stepFields[fieldIndex] = newOrder;
        } else {
          step.stepFields.splice(
            0,
            step.stepFields.length,
            ...newOrder,
          );
        }
      } else {
        if (typeof fieldIndex === "number") {
          const formElements = draft.formElements as FormElementList;
          validateFieldIndex(formElements, fieldIndex);
          formElements[fieldIndex] = newOrder;
        } else {
          draft.formElements = newOrder;
        }
      }
    });
  } catch (error) {
    console.error("Failed to reorder elements:", error);
    throw error;
  }
};

/**
 * Reset form elements to empty
 */
export const resetFormElements = (): boolean => {
  try {
    formBuilderCollection.update(FORM_ID, (draft) => {
      draft.formElements = [];
    });
    return true;
  } catch (error) {
    console.error("Failed to reset form elements:", error);
    return false;
  }
};

// ============================================================================
// Multi-Step Form Operations
// ============================================================================

/**
 * Add a new step to multi-step form
 */
export const addFormStep = (currentPosition?: number): boolean => {
  try {
    formBuilderCollection.update(FORM_ID, (draft) => {
      if (!draft.isMS) {
        throw new FormBuilderError(
          "Cannot add form step to single-step form",
          "NOT_MULTI_STEP_FORM",
        );
      }
      const defaultStep: FormStep = { id: uuid(), stepFields: [] };
      const formSteps = draft.formElements as FormStep[];

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
        draft.formElements = updatedSteps;
        draft.lastAddedStepIndex = nextPosition;
      } else {
        const newIndex = formSteps.length;
        formSteps.push(defaultStep);
        draft.lastAddedStepIndex = newIndex;
      }
    });
    return true;
  } catch (error) {
    console.error("Failed to add form step:", error);
    return false;
  }
};

/**
 * Remove a step from multi-step form
 */
export const removeFormStep = (stepIndex: number): boolean => {
  try {
    formBuilderCollection.update(FORM_ID, (draft) => {
      if (!draft.isMS) {
        throw new FormBuilderError(
          "Cannot remove form step from single-step form",
          "NOT_MULTI_STEP_FORM",
        );
      }
      const formSteps = draft.formElements as FormStep[];
      validateStepIndex(formSteps, stepIndex);

      if (formSteps.length <= 1) {
        throw new FormBuilderError(
          "Cannot remove the last step from a multi-step form",
          "CANNOT_REMOVE_LAST_STEP",
        );
      }
      draft.formElements = dropAtIndex(formSteps, stepIndex);
    });
    return true;
  } catch (error) {
    console.error("Failed to remove form step:", error);
    return false;
  }
};

/**
 * Reorder steps
 */
export const reorderSteps = (newOrder: FormStep[]): boolean => {
  try {
    formBuilderCollection.update(FORM_ID, (draft) => {
      draft.formElements = newOrder;
    });
    return true;
  } catch (error) {
    console.error("Failed to reorder steps:", error);
    return false;
  }
};

// ============================================================================
// Form Array Operations
// ============================================================================

/**
 * Add a form array
 */
export const addFormArray = (
  arrayField: FormElementList,
  stepIndex?: number,
): boolean => {
  try {
    formBuilderCollection.update(FORM_ID, (draft) => {
      const defaultEntry: FormArrayEntry = {
        id: uuid(),
        fields: arrayField.map((field: FormElement | FormElement[]) => {
          if (Array.isArray(field)) {
            return field.map((nestedField: FormElement) => ({
              ...nestedField,
              id: uuid(),
              name: `${nestedField.name.replace(/-/g, "_")}_default_${Date.now()}`,
            }));
          }
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
        entries: [defaultEntry],
      };

      if (isFormArrayForm(draft.formElements as FormElementList)) {
        (draft.formElements as FormArray[]).push(newFormArray);
      } else if (isMultiStepForm(draft.formElements as FormElementList)) {
        const formSteps = draft.formElements as FormStep[];
        const targetStepIndex =
          stepIndex ?? draft.lastAddedStepIndex ?? formSteps.length - 1;
        if (stepIndex !== undefined) {
          validateStepIndex(formSteps, targetStepIndex);
        }
        formSteps[targetStepIndex].stepFields.push(newFormArray);
      } else {
        (draft.formElements as FormElementList).push(newFormArray);
      }
    });
    return true;
  } catch (error) {
    console.error("Failed to add form array:", error);
    return false;
  }
};

/**
 * Remove a form array
 */
export const removeFormArray = (id: string): boolean => {
  try {
    formBuilderCollection.update(FORM_ID, (draft) => {
      const findAndRemoveFormArray = <T extends FormElementOrList>(elements: T[]): T[] => {
        return elements.filter((el) => {
          if (isFormArray(el)) {
            return el.id !== id;
          }
          return true;
        });
      };

      if (isFormArrayForm(draft.formElements as FormElementList)) {
        draft.formElements = findAndRemoveFormArray(draft.formElements as FormElementList);
      } else if (isMultiStepForm(draft.formElements as FormElementList)) {
        const formSteps = draft.formElements as FormStep[];
        for (const step of formSteps) {
          step.stepFields = findAndRemoveFormArray(step.stepFields);
        }
      } else {
        draft.formElements = findAndRemoveFormArray(draft.formElements as FormElementList);
      }
    });
    return true;
  } catch (error) {
    console.error("Failed to remove form array:", error);
    return false;
  }
};

/**
 * Update form array properties
 */
export const updateFormArrayProperties = (
  id: string,
  properties: Partial<FormArray>,
): boolean => {
  try {
    formBuilderCollection.update(FORM_ID, (draft) => {
      const findAndUpdateFormArray = <T extends FormElementOrList>(elements: T[]): void => {
        for (let i = 0; i < elements.length; i++) {
          const el = elements[i];
          if (isFormArray(el)) {
            if (el.id === id) {
              elements[i] = { ...el, ...properties } as T;
            }
          }
        }
      };

      if (isFormArrayForm(draft.formElements as FormElementList)) {
        findAndUpdateFormArray(draft.formElements as FormElementList);
      } else if (isMultiStepForm(draft.formElements as FormElementList)) {
        const formSteps = draft.formElements as FormStep[];
        for (const step of formSteps) {
          findAndUpdateFormArray(step.stepFields);
        }
      } else {
        findAndUpdateFormArray(draft.formElements as FormElementList);
      }
    });
    return true;
  } catch (error) {
    console.error("Failed to update form array properties:", error);
    return false;
  }
};

/**
 * Add a form array entry
 */
export const addFormArrayEntry = (arrayId: string): boolean => {
  try {
    formBuilderCollection.update(FORM_ID, (draft) => {
      const findAndUpdateFormArray = (elements: FormElementList): void => {
        for (let i = 0; i < elements.length; i++) {
          const el = elements[i];
          if (isFormArray(el)) {
            if (el.id === arrayId) {
              const formArray = el;
              const newEntry: FormArrayEntry = {
                id: uuid(),
                fields: formArray.arrayField.map((field) => {
                  if (Array.isArray(field)) {
                    return field.map((nestedField) => ({
                      ...nestedField,
                      id: uuid(),
                      name: `${formArray.name?.replace(/-/g, "_")}[${formArray.entries.length}].${nestedField.name.replace(/-/g, "_")}`,
                    }));
                  }
                  return {
                    ...field,
                    id: uuid(),
                    name: `${formArray.name?.replace(/-/g, "_")}[${formArray.entries.length}].${field.name.replace(/-/g, "_")}`,
                  };
                }),
              };
              formArray.entries.push(newEntry);
            }
          }
        }
      };

      if (isFormArrayForm(draft.formElements as FormElementList)) {
        findAndUpdateFormArray(draft.formElements as FormElementList);
      } else if (isMultiStepForm(draft.formElements as FormElementList)) {
        const formSteps = draft.formElements as FormStep[];
        for (const step of formSteps) {
          findAndUpdateFormArray(step.stepFields);
        }
      } else {
        findAndUpdateFormArray(draft.formElements as FormElementList);
      }
    });
    return true;
  } catch (error) {
    console.error("Failed to add form array entry:", error);
    return false;
  }
};

/**
 * Remove a form array entry
 */
export const removeFormArrayEntry = (
  arrayId: string,
  entryId: string,
): boolean => {
  try {
    formBuilderCollection.update(FORM_ID, (draft) => {
      const findAndUpdateFormArray = (elements: FormElementList): void => {
        for (let i = 0; i < elements.length; i++) {
          const el = elements[i];
          if (isFormArray(el)) {
            if (el.id === arrayId) {
              const formArray = el;
              if (formArray.entries.length > 0 && formArray.entries[0].id === entryId) {
                throw new FormBuilderError(
                  "Cannot delete the first entry (default entry) from FormArray",
                  "CANNOT_DELETE_FIRST_ENTRY",
                );
              }
              formArray.entries = formArray.entries.filter(
                (entry) => entry.id !== entryId,
              );
            }
          }
        }
      };

      if (!draft.formElements) {
        return;
      }

      if (isFormArrayForm(draft.formElements)) {
        findAndUpdateFormArray(draft.formElements as FormElementList);
      } else if (isMultiStepForm(draft.formElements)) {
        const formSteps = draft.formElements as FormStep[];
        for (const step of formSteps) {
          findAndUpdateFormArray(step.stepFields);
        }
      } else {
        findAndUpdateFormArray(draft.formElements as FormElementList);
      }
    });
    return true;
  } catch (error) {
    console.error("Failed to remove form array entry:", error);
    return false;
  }
};

/**
 * Add a field to form array
 */
export const addFormArrayField = (
  arrayId: string,
  fieldType: FormElement["fieldType"],
): boolean => {
  if (!validateFieldType(fieldType)) {
    return false;
  }

  try {
    formBuilderCollection.update(FORM_ID, (draft) => {
      const templateElement = defaultFormElements[fieldType];
      const newFormElement = {
        id: uuid(),
        ...templateElement,
        content: templateElement.content,
        label: (templateElement as FormElement).label || templateElement.content,
        name: `${fieldType}_${Date.now()}`.replace(/-/g, "_"),
        required: true,
        fieldType,
      } as FormElement;

      const findAndUpdateFormArray = (elements: FormElementList): void => {
        for (let i = 0; i < elements.length; i++) {
          const el = elements[i];
          if (isFormArray(el)) {
            if (el.id === arrayId) {
              const formArray = el;
              formArray.arrayField.push(newFormElement);
              formArray.entries = syncEntriesForFormArray(formArray);
            }
          }
        }
      };

      if (!draft.formElements) {
        return;
      }

      if (isFormArrayForm(draft.formElements)) {
        findAndUpdateFormArray(draft.formElements as FormElementList);
      } else if (isMultiStepForm(draft.formElements)) {
        const formSteps = draft.formElements as FormStep[];
        for (const step of formSteps) {
          findAndUpdateFormArray(step.stepFields);
        }
      } else {
        findAndUpdateFormArray(draft.formElements as FormElementList);
      }
    });
    return true;
  } catch (error) {
    console.error("Failed to add form array field:", error);
    return false;
  }
};

/**
 * Remove a field from form array
 */
export const removeFormArrayField = (
  arrayId: string,
  fieldIndex: number,
): boolean => {
  try {
    formBuilderCollection.update(FORM_ID, (draft) => {
      const findAndUpdateFormArray = (elements: FormElementList): void => {
        for (let i = 0; i < elements.length; i++) {
          const el = elements[i];
          if (isFormArray(el)) {
            if (el.id === arrayId) {
              const formArray = el;
              formArray.arrayField = formArray.arrayField.filter(
                (_, index) => index !== fieldIndex,
              );
              formArray.entries = syncEntriesForFormArray(formArray);
            }
          }
        }
      };

      if (isFormArrayForm(draft.formElements as FormElementList)) {
        findAndUpdateFormArray(draft.formElements as FormElementList);
      } else if (isMultiStepForm(draft.formElements as FormElementList)) {
        const formSteps = draft.formElements as FormStep[];
        for (const step of formSteps) {
          findAndUpdateFormArray(step.stepFields);
        }
      } else {
        findAndUpdateFormArray(draft.formElements as FormElementList);
      }
    });
    return true;
  } catch (error) {
    console.error("Failed to remove form array field:", error);
    return false;
  }
};

/**
 * Reorder form array fields
 */
export const reorderFormArrayFields = (
  arrayId: string,
  newOrder: FormElementList,
): boolean => {
  try {
    formBuilderCollection.update(FORM_ID, (draft) => {
      const findAndUpdateFormArray = (elements: FormElementList): void => {
        for (let i = 0; i < elements.length; i++) {
          const el = elements[i];
          if (isFormArray(el)) {
            if (el.id === arrayId) {
              const formArray = el;
              formArray.arrayField = newOrder;
              formArray.entries = syncEntriesForFormArray(formArray);
            }
          }
        }
      };

      if (isFormArrayForm(draft.formElements as FormElementList)) {
        findAndUpdateFormArray(draft.formElements as FormElementList);
      } else if (isMultiStepForm(draft.formElements as FormElementList)) {
        const formSteps = draft.formElements as FormStep[];
        for (const step of formSteps) {
          findAndUpdateFormArray(step.stepFields);
        }
      } else {
        findAndUpdateFormArray(draft.formElements as FormElementList);
      }
    });
    return true;
  } catch (error) {
    console.error("Failed to reorder form array fields:", error);
    return false;
  }
};

/**
 * Sync form array entries with template
 */
export const syncFormArrayEntries = (arrayId: string): boolean => {
  try {
    formBuilderCollection.update(FORM_ID, (draft) => {
      const findAndSyncFormArray = (elements: FormElementList): void => {
        for (let i = 0; i < elements.length; i++) {
          const el = elements[i];
          if (isFormArray(el)) {
            if (el.id === arrayId) {
              const formArray = el;
              formArray.entries = syncEntriesForFormArray(formArray);
            }
          }
        }
      };

      if (isFormArrayForm(draft.formElements as FormElementList)) {
        findAndSyncFormArray(draft.formElements as FormElementList);
      } else if (isMultiStepForm(draft.formElements as FormElementList)) {
        const formSteps = draft.formElements as FormStep[];
        for (const step of formSteps) {
          findAndSyncFormArray(step.stepFields);
        }
      } else {
        findAndSyncFormArray(draft.formElements as FormElementList);
      }
    });
    return true;
  } catch (error) {
    console.error("Failed to sync form array entries:", error);
    return false;
  }
};

/**
 * Update form array template (arrayField)
 */
export const updateFormArray = (id: string, arrayField: FormElementList): boolean => {
  try {
    formBuilderCollection.update(FORM_ID, (draft) => {
      const findAndUpdateFormArray = (elements: FormElementList): void => {
        for (let i = 0; i < elements.length; i++) {
          const el = elements[i];
          if (isFormArray(el)) {
            if (el.id === id) {
              el.arrayField = arrayField;
            }
          }
        }
      };

      if (!draft.formElements) {
        return;
      }

      if (isFormArrayForm(draft.formElements as FormElementList)) {
        findAndUpdateFormArray(draft.formElements as FormElementList);
      } else if (isMultiStepForm(draft.formElements as FormElementList)) {
        const formSteps = draft.formElements as FormStep[];
        for (const step of formSteps) {
          findAndUpdateFormArray(step.stepFields);
        }
      } else {
        findAndUpdateFormArray(draft.formElements as FormElementList);
      }
    });
    // Auto-sync entries when template changes
    syncFormArrayEntries(id);
    return true;
  } catch (error) {
    console.error("Failed to update form array:", error);
    return false;
  }
};

/**
 * Update a specific field within a form array (both template and entries)
 */
export const updateFormArrayField = (
  arrayId: string,
  fieldIndex: number,
  updatedField: Partial<FormElement>,
  nestedIndex?: number,
  updateTemplate = true,
): boolean => {
  try {
    formBuilderCollection.update(FORM_ID, (draft) => {
      const findAndUpdateFormArray = (elements: FormElementList): void => {
        for (let i = 0; i < elements.length; i++) {
          const el = elements[i];
          if (isFormArray(el)) {
            if (el.id === arrayId) {
              const formArray = el;

              // Update template if requested
              if (updateTemplate) {
                if (nestedIndex !== undefined) {
                  const currentField = formArray.arrayField[fieldIndex];
                  if (Array.isArray(currentField)) {
                    currentField[nestedIndex] = { ...currentField[nestedIndex], ...updatedField };
                  } else {
                    formArray.arrayField[fieldIndex] = { ...currentField, ...updatedField };
                  }
                } else {
                  const currentField = formArray.arrayField[fieldIndex];
                  if (!Array.isArray(currentField)) {
                    formArray.arrayField[fieldIndex] = { ...currentField, ...updatedField };
                  }
                }
              }

              // Update all entries
              for (const entry of formArray.entries) {
                const currentField = entry.fields[fieldIndex];
                if (nestedIndex !== undefined && Array.isArray(currentField)) {
                  currentField[nestedIndex] = { ...currentField[nestedIndex], ...updatedField };
                } else if (!Array.isArray(currentField)) {
                  entry.fields[fieldIndex] = { ...currentField, ...updatedField };
                }
              }
            }
          }
        }
      };

      if (!draft.formElements) {
        return;
      }

      if (isFormArrayForm(draft.formElements as FormElementList)) {
        findAndUpdateFormArray(draft.formElements as FormElementList);
      } else if (isMultiStepForm(draft.formElements as FormElementList)) {
        const formSteps = draft.formElements as FormStep[];
        for (const step of formSteps) {
          findAndUpdateFormArray(step.stepFields);
        }
      } else {
        findAndUpdateFormArray(draft.formElements as FormElementList);
      }
    });

    // Sync entries if we updated the template
    if (updateTemplate) {
      syncFormArrayEntries(arrayId);
    }
    return true;
  } catch (error) {
    console.error("Failed to update form array field:", error);
    return false;
  }
};

// ============================================================================
// Template Operations
// ============================================================================

/**
 * Apply a template to the form
 */
export const setTemplate: SetTemplate = (templateName) => {
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

  try {
    const isTemplateMSForm = template.length > 0 && isFormStep(template[0]);
    formBuilderCollection.update(FORM_ID, (draft) => {
      draft.formElements = template;
      draft.isMS = isTemplateMSForm;
    });
  } catch (error) {
    console.error("Failed to set template:", error);
    throw error;
  }
};

// ============================================================================
// Saved Templates Operations
// ============================================================================

/**
 * Save current form as a template
 */
export const saveFormTemplate = (name: string): boolean => {
  try {
    if (typeof window === "undefined") return false;

    const currentForm = getFormData();
    if (!currentForm) {
      throw new Error("No form data to save");
    }

    const safeKey = `saved-form-template-${name.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase()}`;

    const template: SavedFormTemplate = {
      id: safeKey,
      name,
      data: currentForm,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(safeKey, JSON.stringify(template));
    window.dispatchEvent(new CustomEvent("formTemplateChanged"));
    return true;
  } catch (error) {
    console.error("Failed to save form template:", error);
    return false;
  }
};

/**
 * Get all saved form templates
 */
export const getSavedFormTemplates = (): SavedFormTemplate[] => {
  try {
    if (typeof window === "undefined") return [];

    const savedTemplates: SavedFormTemplate[] = [];
    const keys = Object.keys(localStorage);

    for (const key of keys) {
      if (key.startsWith("saved-form-template-")) {
        try {
          const template = JSON.parse(localStorage.getItem(key) || "{}");
          if (template?.id && template.name && template.data) {
            savedTemplates.push(template);
          }
        } catch (e) {
          console.warn(`Invalid saved template in key ${key}:`, e);
        }
      }
    }

    return savedTemplates.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  } catch (error) {
    console.error("Failed to get saved form templates:", error);
    return [];
  }
};

/**
 * Load a saved form template
 */
export const loadFormTemplate = (templateId: string): boolean => {
  try {
    if (typeof window === "undefined") return false;

    const templateData = localStorage.getItem(templateId);
    if (!templateData) {
      throw new Error(`Template ${templateId} not found`);
    }

    const template: SavedFormTemplate = JSON.parse(templateData);

    formBuilderCollection.update(FORM_ID, (draft) => {
      Object.assign(draft, template.data);
    });
    return true;
  } catch (error) {
    console.error(`Failed to load form template ${templateId}:`, error);
    return false;
  }
};

/**
 * Delete a saved form template
 */
export const deleteFormTemplate = (templateId: string): boolean => {
  try {
    if (typeof window === "undefined") return false;

    localStorage.removeItem(templateId);
    window.dispatchEvent(new CustomEvent("formTemplateChanged"));
    return true;
  } catch (error) {
    console.error(`Failed to delete form template ${templateId}:`, error);
    return false;
  }
};

// ============================================================================
// Initialization
// ============================================================================

/**
 * Initialize the form builder store with defaults
 */
export const initializeFormBuilder = createIsomorphicFn()
  .server((): boolean => {
    return true;
  })
  .client((): boolean => {
    try {
      try {
        const existing = formBuilderCollection.get(FORM_ID);
        if (existing) {
          return true;
        }
      } catch (_error) {
        localStorage.removeItem("form-builder");
      }

      formBuilderCollection.insert([
        {
          id: FORM_ID,
          formName: "draft",
          schemaName: "draftFormSchema",
          isMS: false,
          formElements: DEFAULT_FORM_ELEMENTS,
          settings: DEFAULT_FORM_SETTINGS,
        },
      ]);
      return true;
    } catch (error) {
      console.error("Failed to initialize form builder:", error);
      return false;
    }
  })();

export { FormBuilderError, isFormArray, isFormStep, isMultiStepForm, isFormArrayForm };
