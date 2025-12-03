import type { ColumnConfig } from "@/types/table-types";
import { capitalize, toCamelCase } from "@/utils/utils";

const getTypeScriptType = (col: ColumnConfig): string => {
	switch (col.type) {
		case "string":
			return "string";
		case "number":
			return "number";
		case "boolean":
			if (col.possibleValues && col.possibleValues.length > 0) {
				return col.possibleValues.map((v) => `"${v}"`).join(" | ");
			}
			return "boolean";
		case "date":
			return "string"; // Dates stored as strings
		case "object":
			return "any";
		case "array":
			return "any[]";
		case "enum":
			if (col.possibleValues && col.possibleValues.length > 0) {
				return col.possibleValues.map((v) => `"${v}"`).join(" | ");
			}
			return "string";
		default:
			return "string";
	}
};

export const generateTableType = (
	columns: ColumnConfig[],
	customName?: string,
): string => {
	const interfaceName = customName
		? `${capitalize(customName)}Data`
		: "TableData";
	const properties = columns
		.map((col) => `\t${toCamelCase(col.label)}: ${getTypeScriptType(col)};`)
		.join("\n");

	return `export interface ${interfaceName} {\n${properties}\n}`;
};

const formatValue = (value: any, col: ColumnConfig): string => {
	if (value === null || value === undefined) {
		return "null";
	}

	// For boolean/enum fields with possibleValues, treat as strings
	if (
		(col.type === "boolean" || col.type === "enum") &&
		col.possibleValues &&
		col.possibleValues.length > 0
	) {
		return `"${String(value).replace(/"/g, '\\"')}"`;
	}

	switch (col.type) {
		case "string":
			return `"${String(value).replace(/"/g, '\\"')}"`;
		case "number":
			return String(value);
		case "boolean":
			return String(value);
		case "date":
			return `"${String(value)}"`;
		case "object":
			return JSON.stringify(value);
		case "array":
			return JSON.stringify(value);
		case "enum":
			return `"${String(value)}"`;
		default:
			return `"${String(value).replace(/"/g, '\\"')}"`;
	}
};

export const generateTableData = (
	data: Record<string, any>[],
	columns: ColumnConfig[],
	customName?: string,
): string => {
	const constName = customName ? `${customName}Data` : "tableData";

	if (data.length === 0) {
		return `import { ${constName} } from "./${customName}";\t\n\n
export const ${toCamelCase(constName)}: ${customName ? `${capitalize(customName)}Data` : "TableData"}[] = [];`;
	}

	const dataLines = data.map((row) => {
		const properties = columns
			.map((col) => {
				const value = row[col.accessor];
				return `\t\t${toCamelCase(col.label)}: ${formatValue(value, col)}`;
			})
			.join(",\n");
		return `\t{\n${properties}\n\t}`;
	});

	return `import { ${constName} } from "./${customName}";\t\n\n
	export const ${toCamelCase(constName)}: ${customName ? `${capitalize(customName)}Data` : "TableData"}[] = [\n${dataLines.join(",\n")}\n];`;
};
