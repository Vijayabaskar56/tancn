import type { Settings } from "@/components/form-components/types";
import type {
	FormArray,
	FormElement,
	FormElementOrList,
	FormStep,
} from "@/types/form-types";
import { generateFormCode as generateReactFormCode } from "./react/generate-form-code";
import {
	extractImportDependencies as extractReactImportDependencies,
	generateImports as generateReactImports,
} from "./react/generate-imports";
import { generateFormCode as generateSolidFormCode } from "./solid/generate-form-code";
import {
	extractImportDependencies as extractSolidImportDependencies,
	generateImports as generateSolidImports,
} from "./solid/generate-imports";

/**
 * Generates form code based on the preferred framework
 */
export const generateFormCode = ({
	formElements,
	isMS,
	validationSchema,
	settings,
	formName,
	preferredFramework = "react",
}: {
	formElements: FormElementOrList[] | FormStep[];
	isMS: boolean;
	validationSchema: Settings["preferredSchema"];
	settings: Settings;
	formName: string;
	preferredFramework?: "react" | "solid" | "vue" | "angular";
}): { file: string; code: string }[] => {
	if (preferredFramework === "solid") {
		return generateSolidFormCode({
			formElements,
			isMS,
			validationSchema,
			settings,
			formName,
		});
	}

	// Default to React for backward compatibility
	return generateReactFormCode({
		formElements,
		isMS,
		validationSchema,
		settings,
		formName,
	});
};

/**
 * Generates imports based on the preferred framework
 */
export const generateImports = (
	formElements: (FormElement | FormArray)[],
	validationSchema: unknown,
	isMS: boolean,
	schemaName: string,
	preferredFramework: "react" | "solid" | "vue" | "angular" = "react",
): Set<string> => {
	if (preferredFramework === "solid") {
		return generateSolidImports(
			formElements,
			validationSchema,
			isMS,
			schemaName,
		);
	}

	// Default to React for backward compatibility
	return generateReactImports(formElements, validationSchema, isMS, schemaName);
};

/**
 * Extracts import dependencies based on the preferred framework
 */
export const extractImportDependencies = (
	importSet: Set<string>,
	preferredFramework: "react" | "solid" | "vue" | "angular" = "react",
): { registryDependencies: string[]; dependencies: string[] } => {
	if (preferredFramework === "solid") {
		return extractSolidImportDependencies(importSet);
	}

	// Default to React for backward compatibility
	return extractReactImportDependencies(importSet);
};
