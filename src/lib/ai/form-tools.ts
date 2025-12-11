import { toolDefinition } from "@tanstack/ai";
import { z } from "zod";

// ============================================================================
// Zod Schema for AI Tool - Fully inlined for Gemini API compatibility
// (Gemini doesn't support $ref or definitions in JSON Schema)
// ============================================================================

// ============================================================================
// Tool Definition for AI Form Generation
// ============================================================================

export const generateFormDef = toolDefinition({
  name: "generate_form",
  description: `Generate a form for the form builder.

For SINGLE-PAGE forms: Set isMultiStep to false and put all fields in formElements.
For MULTI-STEP wizard forms: Set isMultiStep to true and organize fields in the steps array.

Field types and their required properties:
- Input: name, label, type (text/email/password/tel/number/url)
- Password: name, label
- Textarea: name, label
- Checkbox: name, label
- Switch: name, label
- RadioGroup: name, label, options (array of {value, label})
- Select: name, label, options, placeholder
- MultiSelect: name, label, options, placeholder
- ToggleGroup: name, label, options, toggleType (single/multiple)
- Slider: name, label, min, max, step
- DatePicker: name, label
- H1/H2/H3: content, static=true
- Separator: static=true
- FormArray: name, label, arrayField (template fields that repeat)

SIDE-BY-SIDE FIELD PLACEMENT:
- Use grouped: true on consecutive fields to place them horizontally next to each other
- Example: first_name (grouped: true), last_name (grouped: true) will appear side-by-side
- Common patterns: first/last name, city/state/zip, start/end date
- Only group 2-3 related fields maximum for good UX`,
  inputSchema: z.object({
    title: z.string().describe("Descriptive title for the form"),
    description: z.string().describe("Brief description of the form's purpose"),
    isMultiStep: z.boolean().describe("Set to true for multi-step/wizard forms, false for single-page"),

    // For single-page forms - fully inlined schema
    formElements: z.array(z.object({
      id: z.string().describe("Unique UUID for the field"),
      fieldType: z.string().describe("Field type: Input, Password, Textarea, Checkbox, Switch, RadioGroup, Select, MultiSelect, ToggleGroup, Slider, DatePicker, H1, H2, H3, Separator, FormArray"),
      name: z.string().describe("Field name in snake_case"),
      label: z.string().optional().describe("Display label"),
      description: z.string().optional().describe("Help text"),
      placeholder: z.string().optional().describe("Placeholder text"),
      required: z.boolean().optional().describe("Is required"),
      disabled: z.boolean().optional().describe("Is disabled"),
      grouped: z.boolean().optional().describe("Set to true to place this field side-by-side with adjacent grouped fields"),
      type: z.string().optional().describe("Input type: text, email, password, tel, number, url"),
      options: z.array(z.object({
        value: z.string().describe("Option value"),
        label: z.string().describe("Option label"),
      })).optional().describe("Options for Select/RadioGroup/ToggleGroup"),
      min: z.number().optional().describe("Slider min"),
      max: z.number().optional().describe("Slider max"),
      step: z.number().optional().describe("Slider step"),
      content: z.string().optional().describe("Content for H1/H2/H3/Separator"),
      static: z.boolean().optional().describe("True for static elements"),
      checked: z.boolean().optional().describe("Initial checked state"),
      // FormArray specific
      arrayField: z.array(z.object({
        id: z.string().describe("Unique UUID for template field"),
        fieldType: z.string().describe("Field type for repeatable field"),
        name: z.string().describe("Field name in snake_case"),
        label: z.string().optional().describe("Display label"),
        placeholder: z.string().optional().describe("Placeholder text"),
        required: z.boolean().optional().describe("Is required"),
        type: z.string().optional().describe("Input type"),
        options: z.array(z.object({
          value: z.string().describe("Option value"),
          label: z.string().describe("Option label"),
        })).optional().describe("Options for select fields"),
      })).optional().describe("Template fields for FormArray - these repeat for each entry"),
    })).optional().describe("Form fields for single-page forms (when isMultiStep is false)"),

    // For multi-step forms - fully inlined schema
    steps: z.array(z.object({
      id: z.string().describe("Unique UUID for the step"),
      stepFields: z.array(z.object({
        id: z.string().describe("Unique UUID for the field"),
        fieldType: z.string().describe("Field type: Input, Password, Textarea, Checkbox, Switch, RadioGroup, Select, MultiSelect, ToggleGroup, Slider, DatePicker, H1, H2, H3, Separator, FormArray"),
        name: z.string().describe("Field name in snake_case"),
        label: z.string().optional().describe("Display label"),
        description: z.string().optional().describe("Help text"),
        placeholder: z.string().nonempty('Placeholder is required').describe("Placeholder text"),
        required: z.boolean().optional().describe("Is required"),
        disabled: z.boolean().optional().describe("Is disabled"),
        grouped: z.boolean().optional().describe("Set to true to place this field side-by-side with adjacent grouped fields"),
        type: z.string().optional().describe("Input type: text, email, password, tel, number, url"),
        options: z.array(z.object({
          value: z.string().describe("Option value"),
          label: z.string().describe("Option label"),
        })).optional().describe("Options for Select/RadioGroup/ToggleGroup"),
        min: z.number().optional().describe("Slider min"),
        max: z.number().optional().describe("Slider max"),
        step: z.number().optional().describe("Slider step"),
        content: z.string().optional().describe("Content for H1/H2/H3/Separator"),
        static: z.boolean().optional().describe("True for static elements"),
        checked: z.boolean().optional().describe("Initial checked state"),
        // FormArray specific
        arrayField: z.array(z.object({
          id: z.string().describe("Unique UUID for template field"),
          fieldType: z.string().describe("Field type for repeatable field"),
          name: z.string().describe("Field name in snake_case"),
          label: z.string().optional().describe("Display label"),
          placeholder: z.string().nonempty('Placeholder is required').describe("Placeholder text"),
          required: z.boolean().optional().describe("Is required"),
          type: z.string().optional().describe("Input type"),
          options: z.array(z.object({
            value: z.string().describe("Option value"),
            label: z.string().describe("Option label"),
          })).optional().describe("Options for select fields"),
        })).optional().describe("Template fields for FormArray - these repeat for each entry"),
      })).describe("Fields in this step"),
    })).optional().describe("Form steps for wizard forms (when isMultiStep is true)"),
  }),
  outputSchema: z.object({
    success: z.boolean().describe("Whether the form was successfully created"),
    message: z.string().describe("Confirmation message or error details"),
    fieldCount: z.number().describe("Number of fields created"),
  }),
});

// Re-export types for use elsewhere
export type AIFormElement = {
  id: string;
  fieldType: string;
  name: string;
  label?: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  type?: string;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  step?: number;
  content?: string;
  static?: boolean;
  checked?: boolean;
  grouped?: boolean;
  arrayField?: AIFormElement[];
};

export type AIFormStep = {
  id: string;
  stepFields: AIFormElement[];
};
