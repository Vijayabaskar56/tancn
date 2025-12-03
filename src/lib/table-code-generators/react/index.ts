import type { TableBuilder } from "@/db-collections/table-builder.collections";
import { generateRowActionCode } from "./generate-coloum-code";
import {
	extractTableImportDependencies,
	generateTableImports,
} from "./generate-imports";
import { generateTableCode } from "./generate-table-code";
import { generateTableData, generateTableType } from "./generate-table-data";

export const generateTable = (
	tableBuilder: TableBuilder,
	customName?: string,
): {
	files: { file: string; code: string }[];
	dependencies: { registryDependencies: string[]; dependencies: string[] };
} => {
	// Check if there are any array columns
	let crudImports = "";
	const hasArrayColumns = tableBuilder.table.columns.some(
		(col) => col.type === "array",
	);

	// Check if any column has filterable enabled
	const hasFilterableColumns = tableBuilder.table.columns.some(
		(col) => col.filterable === true,
	);

	const imports = generateTableImports(
		tableBuilder.settings,
		hasArrayColumns,
		hasFilterableColumns,
	);
	if (tableBuilder.settings.enableCRUD) {
		crudImports = generateRowActionCode();
	}
	const typeCode = generateTableType(tableBuilder.table.columns, customName);
	const dataCode = generateTableData(
		tableBuilder.table.data,
		tableBuilder.table.columns,
		customName,
	);
	const { file, code: componentCode } = generateTableCode(
		tableBuilder,
		customName,
	);

	const fullComponentCode = `${Array.from(imports).join("\n")}
${crudImports && crudImports.length > 0 ? `\n${crudImports}` : ""}

${typeCode}

${componentCode}`;

	// const dependencies = extractTableImportDependencies(imports);
	const dependencies = {
		dependencies: ["@tanstack/react-table"],
		registryDependencies: [
			...extractTableImportDependencies(imports).registryDependencies,
		],
	};

	return {
		files: [
			{ file, code: fullComponentCode },
			{ file: "data.ts", code: dataCode },
		],
		dependencies,
	};
};
