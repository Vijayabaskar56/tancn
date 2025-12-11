// apps/web/tests/generate-default-value.test.ts
import { describe, expect, it, vi } from "vitest";
import {
	getDefaultFormElement,
	getDefaultValuesString,
	objectToLiteralString,
} from "@/lib/form-code-generators/react/generate-default-value";
import type { FormStep } from "@/db-collections/form-builder.collections";

// Mock the useFormBuilderState hook
vi.mock("@/hooks/use-form-builder-state", () => ({
	default: vi.fn(),
}));

// Import the mocked function
import useFormBuilderState from "@/hooks/use-form-builder-state";

const mockedUseFormBuilderState = vi.mocked(useFormBuilderState);

describe("Default Value Generator - FormArray Support", () => {
	it("should generate default values for FormArray with proper key quoting", () => {
		const formElements = [
			{
				fieldType: "FormArray" as const,
				id: "test-array",
				name: "formArray_1756969968851",
				label: "Test Array",
				arrayField: [
					{
						fieldType: "Checkbox" as const,
						id: "checkbox1",
						name: "Checkbox_1756969970938",
						label: "Checkbox 1",
						required: false,
					},
					{
						fieldType: "Checkbox" as const,
						id: "checkbox2",
						name: "Checkbox_1756969973410",
						label: "Checkbox 2",
						required: false,
					},
				],
				entries: [],
			},
		];

		const defaultValues = getDefaultFormElement(formElements as any);
		const literalString = objectToLiteralString(defaultValues);

		// Keys should NOT be quoted since they don't contain spaces or start with numbers
		expect(literalString).toContain("formArray_1756969968851:");
		expect(literalString).toContain("Checkbox_1756969970938: false");
		expect(literalString).toContain("Checkbox_1756969973410: false");

		// Should NOT contain quoted keys for these field names
		expect(literalString).not.toContain('"Checkbox_1756969970938"');
		expect(literalString).not.toContain('"Checkbox_1756969973410"');
	});

	it("should quote keys that contain spaces", () => {
		const testObj = {
			normalKey: "value1",
			"key with spaces": "value2",
			"123startsWithNumber": "value3",
		};

		const literalString = objectToLiteralString(testObj);

		expect(literalString).toContain("normalKey:");
		expect(literalString).toContain('"key with spaces":');
		expect(literalString).toContain('"123startsWithNumber":');
	});

	it("should handle nested arrays with objects correctly", () => {
		const testObj = {
			nestedArray: [
				{ Checkbox_123: false, Input_456: "" },
				{ Checkbox_789: true, Input_101: "test" },
			],
		};

		const literalString = objectToLiteralString(testObj);

		// Keys in nested objects should not be quoted
		expect(literalString).toContain("Checkbox_123: false");
		expect(literalString).toContain('Input_456: ""');
		expect(literalString).toContain("Checkbox_789: true");
		expect(literalString).toContain('Input_101: "test"');

		// Should not contain quoted keys for these field names
		expect(literalString).not.toContain('"Checkbox_123"');
		expect(literalString).not.toContain('"Input_456"');
		expect(literalString).not.toContain('"Checkbox_789"');
		expect(literalString).not.toContain('"Input_101"');
	});
});

describe("Default Value Generator - Multi-Step Form Support", () => {
	it("should generate default values for multi-step forms with basic elements", () => {
		// Create a multi-step form with basic elements
		const multiStepFormElements: FormStep[] = [
			{
				id: "step1",
				stepFields: [
					{
						fieldType: "Input" as const,
						id: "input1",
						name: "firstName",
						label: "First Name",
						required: true,
					},
					{
						fieldType: "Checkbox" as const,
						id: "checkbox1",
						name: "agreeToTerms",
						label: "Agree to Terms",
						required: false,
					},
				],
			},
			{
				id: "step2",
				stepFields: [
					{
						fieldType: "Select" as const,
						id: "select1",
						name: "country",
						label: "Country",
						options: [
							{ value: "us", label: "United States" },
							{ value: "ca", label: "Canada" },
						],
						placeholder: "Select a country",
						required: true,
					},
					{
						fieldType: "MultiSelect" as const,
						id: "multiselect1",
						name: "interests",
						label: "Interests",
						options: [
							{ value: "tech", label: "Technology" },
							{ value: "sports", label: "Sports" },
						],
						placeholder: "Select interests",
						required: false,
					},
				],
			},
		];

		// Mock the useFormStore hook
		mockedUseFormBuilderState.mockReturnValue({
			isMS: true,
			formElements: multiStepFormElements,
			formName: "Test Form",
			schemaName: "formSchema",
			validationSchema: "zod",
			framework: "react",
			actions: {} as any,
			computed: {} as any,
			batch: {} as any,
			subscriptions: {} as any,
			errors: {} as any,
			stores: {} as any,
		});

		const result = getDefaultValuesString("zod", "formSchema", multiStepFormElements);

		// Should contain default values from all steps
		expect(result).toContain('firstName: ""');
		expect(result).toContain("agreeToTerms: false");
		expect(result).toContain('country: "us"'); // First option as default
		expect(result).toContain("interests: []"); // Empty array for MultiSelect

		// Should be properly formatted as a TypeScript type assertion
		expect(result).toContain("as z.input<typeof formSchema>");
	});

	it("should generate default values for multi-step forms with FormArrays", () => {
		const multiStepFormWithArrays: FormStep[] = [
			{
				id: "step1",
				stepFields: [
					{
						fieldType: "Input" as const,
						id: "input1",
						name: "userName",
						label: "Username",
						required: true,
					},
				],
			},
			{
				id: "step2",
				stepFields: [
					{
						fieldType: "FormArray" as any,
						id: "addresses",
						name: "addresses",
						label: "Addresses",
						arrayField: [
							{
								fieldType: "Input" as const,
								id: "street",
								name: "street",
								label: "Street Address",
								required: true,
							},
							{
								fieldType: "Input" as const,
								id: "city",
								name: "city",
								label: "City",
								required: true,
							},
						],
						entries: [],
					} as any,
				],
			},
		];

		// Mock the useFormStore hook
		mockedUseFormBuilderState.mockReturnValue({
			isMS: true,
			formElements: multiStepFormWithArrays,
			formName: "Test Form",
			schemaName: "formSchema",
			validationSchema: "zod",
			framework: "react",
			actions: {} as any,
			computed: {} as any,
			batch: {} as any,
			subscriptions: {} as any,
			errors: {} as any,
			stores: {} as any,
		});

		const result = getDefaultValuesString("zod", "formSchema", multiStepFormWithArrays);

		// Should contain default values from regular fields
		expect(result).toContain('userName: ""');

		// Should contain FormArray default with one entry
		expect(result).toContain("addresses:");
		expect(result).toContain('street: ""');
		expect(result).toContain('city: ""');
		expect(result).toContain('[\n  {\n  street: "",\n  city: ""\n}\n]');
	});

	it("should handle empty multi-step forms", () => {
		const emptyMultiStepForm: FormStep[] = [
			{
				id: "step1",
				stepFields: [],
			},
			{
				id: "step2",
				stepFields: [],
			},
		];

		// Mock the useFormStore hook
		mockedUseFormBuilderState.mockReturnValue({
			isMS: true,
			formElements: emptyMultiStepForm,
			formName: "Test Form",
			schemaName: "formSchema",
			validationSchema: "zod",
			framework: "react",
			actions: {} as any,
			computed: {} as any,
			batch: {} as any,
			subscriptions: {} as any,
			errors: {} as any,
			stores: {} as any,
		});

		const result = getDefaultValuesString("zod", "formSchema", emptyMultiStepForm);

		// Should return empty object
		expect(result).toContain("{}");
		expect(result).toContain("as z.input<typeof formSchema>");
	});

	it("should work with different validation schemas for multi-step forms", () => {
		const simpleMultiStepForm: FormStep[] = [
			{
				id: "step1",
				stepFields: [
					{
						fieldType: "Input" as const,
						id: "input1",
						name: "email",
						label: "Email",
						required: true,
					},
				],
			},
		];

		// Test with Valibot
		mockedUseFormBuilderState.mockReturnValue({
			isMS: true,
			formElements: simpleMultiStepForm,
			formName: "Test Form",
			schemaName: "formSchema",
			validationSchema: "valibot",
			framework: "react",
			actions: {} as any,
			computed: {} as any,
			batch: {} as any,
			subscriptions: {} as any,
			errors: {} as any,
			stores: {} as any,
		});

		const valibotResult = getDefaultValuesString("valibot", "formSchema", simpleMultiStepForm);

		// Test with Arktype
		mockedUseFormBuilderState.mockReturnValue({
			isMS: true,
			formElements: simpleMultiStepForm,
			formName: "Test Form",
			schemaName: "formSchema",
			validationSchema: "arktype",
			framework: "react",
			actions: {} as any,
			computed: {} as any,
			batch: {} as any,
			subscriptions: {} as any,
			errors: {} as any,
			stores: {} as any,
		});

		const arktypeResult = getDefaultValuesString("arktype", "formSchema", simpleMultiStepForm);

		// Should contain correct type assertions
		expect(valibotResult).toContain("as v.InferInput<typeof formSchema>");
		expect(arktypeResult).toContain("as typeof formSchema.infer");

		// Both should contain the email field default
		expect(valibotResult).toContain('email: ""');
		expect(arktypeResult).toContain('email: ""');
	});
});
