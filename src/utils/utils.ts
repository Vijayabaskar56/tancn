import { createClientOnlyFn, createIsomorphicFn } from "@tanstack/react-start";
import { type ClassValue, clsx } from "clsx";
import js_beautify from "js-beautify";
import { twMerge } from "tailwind-merge";
import {
	type SettingsCollection,
	settingsCollection,
} from "@/db-collections/settings.collections";
import type { JsonData } from "@/types/table-types";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const isStatic = (fieldType: string) => {
	return [
		"Separator",
		"H1",
		"H2",
		"H3",
		"FieldDescription",
		"FieldLegend",
	].includes(fieldType);
};

export function toPascalCase(str: string): string {
	return str
		.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
			index === 0 ? word.toUpperCase() : word.toUpperCase(),
		)
		.replace(/\s+/g, "");
}

export function toCamelCase(str: string): string {
	return str
		.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
			index === 0 ? word.toLowerCase() : word.toUpperCase(),
		)
		.replace(/\s+/g, "");
}

export function toKebabCase(str: string): string {
	return str
		.replace(/([a-z])([A-Z])/g, "$1-$2")
		.replace(/[\s_]+/g, "-")
		.toLowerCase();
}

export function capitalize(str: string): string {
	const cleaned = str.replace(/[\s\-_]+/g, "");
	return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

export function generateFormNames(formName: string) {
	const pascal = toPascalCase(formName);
	const camel = toCamelCase(formName);
	const kebab = toKebabCase(formName);

	return {
		componentName: `${pascal}Form`,
		variableName: `${camel}Form`,
		schemaName: `${camel}FormSchema`,
		schemaFileName: `${kebab}-form-schema`,
	};
}

export function formatCode(code: string): string {
	// Split code into lines
	const lines = code.split("\n");
	const importLines: string[] = [];
	const nonImportLines: string[] = [];

	// Separate imports from other code
	let currentImport = "";
	let inImport = false;

	for (const line of lines) {
		const trimmedLine = line.trim();

		// Check if line starts an import
		if (trimmedLine.startsWith("import ") && trimmedLine.includes("{")) {
			inImport = true;
			currentImport = trimmedLine;

			// If import is complete on one line
			if (trimmedLine.includes("}") && trimmedLine.includes("from")) {
				// Clean up single-line import
				const cleanImport = currentImport.replace(/\s+/g, " ").trim();
				importLines.push(cleanImport);
				currentImport = "";
				inImport = false;
			}
		} else if (inImport) {
			// Continue building multi-line import
			currentImport += ` ${trimmedLine}`;

			// Check if import is complete
			if (trimmedLine.includes("}") && currentImport.includes("from")) {
				// Clean up multi-line import to single line
				const cleanImport = currentImport
					.replace(/\s*\n\s*/g, " ")
					.replace(/\s+/g, " ")
					.replace(/\{\s+/g, "{ ")
					.replace(/\s+\}/g, " }")
					.trim();
				importLines.push(cleanImport);
				currentImport = "";
				inImport = false;
			}
		} else if (trimmedLine.startsWith("import ")) {
			// Handle other types of imports (default imports, etc.)
			importLines.push(trimmedLine);
		} else if (/^["']use (client|server)["']/.test(trimmedLine)) {
			// Handle use client directive
			importLines.push(trimmedLine);
		} else {
			// Regular code line
			nonImportLines.push(line);
		}
	}

	// Format only the non-import code with js_beautify
	const nonImportCode = nonImportLines.join("\n");
	const formattedNonImportCode = js_beautify(nonImportCode, {
		indent_size: 2,
		indent_char: " ",
		max_preserve_newlines: 1,
		preserve_newlines: false,
		keep_array_indentation: false,
		break_chained_methods: false,
		brace_style: "collapse",
		space_before_conditional: true,
		unescape_strings: false,
		jslint_happy: false,
		end_with_newline: false,
		wrap_line_length: 0,
		comma_first: false,
		e4x: true,
		indent_empty_lines: false,
	});

	// Combine imports and formatted code
	const result = [...importLines, "", ...formattedNonImportCode.split("\n")]
		.filter((line, index, arr) => {
			// Remove excessive empty lines
			if (line.trim() === "") {
				return index === 0 || arr[index - 1]?.trim() !== "";
			}
			return true;
		})
		.join("\n");

	return result;
}

export const updatePreferredPackageManager = createClientOnlyFn(
	(value: SettingsCollection["preferredPackageManager"]) => {
		settingsCollection?.update("user-settings", (draft: SettingsCollection) => {
			draft.preferredPackageManager = value;
		});
	},
);

export const logger = createIsomorphicFn()
	.server((msg: string, data?: unknown) => console.log(`[SERVER]: ${msg}`, data))
	.client((msg: string, data?: unknown) => {
		if (import.meta.env.DEV) {
			console.log(`[CLIENT]: ${msg}`, data);
		}
	});

export const toJSLiteral = (value: unknown): string => {
	if (typeof value === "string") return JSON.stringify(value);
	if (typeof value === "number" || typeof value === "boolean")
		return String(value);
	if (value === null) return "null";
	if (Array.isArray(value)) return `[${value.map(toJSLiteral).join(", ")}]`;
	if (typeof value === "object") {
		const entries = Object.entries(value).map(
			([k, v]) => `${k}: ${toJSLiteral(v)}`,
		);
		return `{ ${entries.join(", ")} }`;
	}
	return "undefined";
};

import { detectColumnsConfig } from "../lib/column-detection";

export const detectColumns = (data: JsonData[]) => detectColumnsConfig(data);


export const getRegistryUrl = (framework?: SettingsCollection["preferredFramework"]) => {
	if (!framework) return `${import.meta.env.MODE === "development" ? "http://localhost:3000" : `https://tancn.dev`}`;
	return `${import.meta.env.MODE === "development" ? "http://localhost:3000" : `${import.meta.env.VITE_APP_URL}`}/r/${framework.toLowerCase()}`;
};