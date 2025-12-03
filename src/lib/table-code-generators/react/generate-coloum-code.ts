import type { TableBuilder } from "@/db-collections/table-builder.collections";
import type { ColumnConfig } from "@/types/table-types";
import { toCamelCase } from "@/utils/utils";

// Generate cell content as string for code generation
export function renderCellString(
	valueExpr: string,
	type: ColumnConfig["type"],
): string {
	switch (type) {
		case "string":
			return `<div className="font-medium">{String(${valueExpr} || "")}</div>`;
		case "number":
			return `<div>{${valueExpr}.toLocaleString()}</div>`;
		case "boolean":
			return `<Badge>{${valueExpr} ? "YES" : "NO"}</Badge>`;
		case "date":
			return `${valueExpr} ? <div>{new Date(${valueExpr}).toLocaleDateString()}</div> : <div></div>`;
		case "object":
			return `<div className="text-xs text-muted-foreground">{${valueExpr} ? JSON.stringify(${valueExpr}) : ""}</div>`;
		case "array":
			return `<div className="flex flex-wrap gap-1">
				{${valueExpr}.slice(0, 2).map((item, index) => {
					const colors = ["border-blue-500", "border-green-500", "border-yellow-500", "border-purple-500", "border-pink-500", "border-indigo-500", "border-red-500", "border-orange-500", "border-teal-500", "border-cyan-500"];
					const colorIndex = index % colors.length;
					return <Badge key={index} variant="outline" className={\`text-xs \${colors[colorIndex]}\`}>{String(item)}</Badge>;
				})}
				{${valueExpr}.length > 2 && <Badge variant="outline" className="text-xs">+{${valueExpr}.length - 2}</Badge>}
			</div>`;
		default:
			return `<div>{String(${valueExpr} || "")}</div>`;
	}
}

export const generateRowActionCode = () => {
	return `// Row actions component
function RowActions({ row: _row }: { row: any }) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<div className="flex justify-end">
					<Button
						size="icon"
						variant="ghost"
						className="shadow-none"
						aria-label="Edit item"
					>
						<EllipsisIcon size={16} aria-hidden="true" />
					</Button>
				</div>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuGroup>
					<DropdownMenuItem>
						<span>Edit</span>
						<DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
					</DropdownMenuItem>
					<DropdownMenuItem>
						<span>Duplicate</span>
						<DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem>
						<span>Archive</span>
						<DropdownMenuShortcut>⌘A</DropdownMenuShortcut>
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuItem className="text-destructive focus:text-destructive">
					<span>Delete</span>
					<DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}`;
};

/**
 * Generates the columns array as a string, similar to getDefaultValuesString for forms
 */
export const getColumnsString = (
	columns: ColumnConfig[],
	settings?: TableBuilder["settings"] & { enableCRUD?: boolean },
	typeName?: string,
): string => {
	const generatedColumns: string[] = columns.map((col) => {
		const accessor = toCamelCase(col.label);
		const base = `columnHelper.accessor('${accessor}', {
			header: ({ column }) => <DataGridColumnHeader title="${col.label}" column={column} />,
			cell: ({ getValue }) => ${renderCellString("getValue()", col.type)},
			size: 180,
			enableSorting: ${settings?.enableSorting ?? true},
			enableHiding: ${settings?.enableHiding ?? true},
			enableResizing: ${settings?.enableResizing ?? true},
			enablePinning: ${settings?.enablePinning ?? true},
		})`;

		if (col.type === "number") {
			return `columnHelper.accessor('${accessor}', {
				header: ({ column }) => <DataGridColumnHeader title="${col.label}" column={column} />,
				cell: ({ getValue }) => ${renderCellString("getValue()", col.type)},
				size: 180,
				enableSorting: ${settings?.enableSorting ?? true},
				enableHiding: ${settings?.enableHiding ?? true},
				enableResizing: ${settings?.enableResizing ?? true},
				enablePinning: ${settings?.enablePinning ?? true},
				filterFn: (row, columnId, filterValue) => {
					if (!filterValue) return true;
					const [min, max] = filterValue;
					const value = Number(row.getValue(columnId));
					return value >= min && value <= max;
				},
			})`;
		}

		return base;
	});

	const resultColumns: string[] = [];

	// Conditionally add select column
	if (settings?.enableRowSelection) {
		const selectColumn = `columnHelper.display({
          id: 'select',
          header: () => <DataGridTableRowSelectAll />,
          cell: ({
            row
          }) => <DataGridTableRowSelect row={row} />,
          size: 35,
          enableSorting: false,
          enableHiding: false,
          enableResizing: false,
          enablePinning: false,
        })`;
		resultColumns.push(selectColumn);
	}

	// Add generated columns
	resultColumns.push(...generatedColumns);

	// Conditionally add actions column
	if (settings?.enableCRUD) {
		const actionsColumn = ` columnHelper.display({
          id: 'actions',
          header: () => <span className="sr-only">Actions</span>,
          cell: ({
            row
          }) => <RowActions row={row} />,
          size: 60,
          enableHiding: false,
          enableSorting: false,
          enableResizing: false,
          enablePinning: false,
        })`;
		resultColumns.push(actionsColumn);
	}

	const type = typeName || "TableData";
	return `const columnHelper = createColumnHelper<${type}>()
const columns = [
	${resultColumns.join(",\n\t")}
]`;
};

/**
 * Maps column types to their applicable filter operators
 */
const getOperatorsForColumnType = (type: ColumnConfig["type"]): string[] => {
	const operatorMap: Record<ColumnConfig["type"], string[]> = {
		string: [
			"is",
			"is_not",
			"contains",
			"not_contains",
			"starts_with",
			"ends_with",
			"equals",
			"not_equals",
			"empty",
			"not_empty",
		],
		number: [
			"equals",
			"not_equals",
			"greater_than",
			"less_than",
			"greater_than_or_equal",
			"less_than_or_equal",
			"between",
			"not_between",
			"empty",
			"not_empty",
		],
		date: ["before", "after", "is", "is_not", "empty", "not_empty"],
		boolean: ["is", "is_not", "empty", "not_empty"],
		enum: ["is", "is_not", "empty", "not_empty"],
		array: [
			"is_any_of",
			"is_not_any_of",
			"includes_all",
			"excludes_all",
			"empty",
			"not_empty",
		],
		object: ["empty", "not_empty"],
	};
	return operatorMap[type] || operatorMap.string;
};

/**
 * Generates the filtering logic as a string, similar to getDefaultValuesString for forms
 */
export const getFilteredDataString = (
	columns: ColumnConfig[],
	typeName?: string,
): string => {
	// Build a set of all operators needed for this table based on column types
	const allOperators = new Set<string>();
	const columnTypeMap = new Map<string, ColumnConfig["type"]>();

	columns.forEach((col) => {
		if (col.filterable !== false) {
			columnTypeMap.set(col.accessor, col.type);
			const operators = getOperatorsForColumnType(col.type);
			for (const op of operators) {
				allOperators.add(op);
			}
		}
	});

	// Generate switch cases for only the operators that are actually needed
	const generateSwitchCases = (): string => {
		const cases: string[] = [];

		// Array operators (special handling for array columns)
		if (allOperators.has("is_any_of")) {
			cases.push(`case "is_any_of":
				if (Array.isArray(fieldValue)) {
					return values.some((selectedValue) => fieldValue.includes(String(selectedValue)));
				}
				return values.some((value) => String(value) === String(fieldValue));`);
		}

		if (allOperators.has("is_not_any_of")) {
			cases.push(`case "is_not_any_of":
				if (Array.isArray(fieldValue)) {
					return !values.some((selectedValue) => fieldValue.includes(String(selectedValue)));
				}
				return !values.some((value) => String(value) === String(fieldValue));`);
		}

		if (allOperators.has("includes_all")) {
			cases.push(`case "includes_all":
				if (Array.isArray(fieldValue)) {
					return values.every((selectedValue) => fieldValue.includes(String(selectedValue)));
				}
				return false;`);
		}

		if (allOperators.has("excludes_all")) {
			cases.push(`case "excludes_all":
				if (Array.isArray(fieldValue)) {
					return !values.some((selectedValue) => fieldValue.includes(String(selectedValue)));
				}
				return true;`);
		}

		// String/enum/boolean operators
		if (allOperators.has("is")) {
			cases.push(`case "is":
				return values.some((value) => String(value) === String(fieldValue));`);
		}

		if (allOperators.has("is_not")) {
			cases.push(`case "is_not":
				return !values.some((value) => String(value) === String(fieldValue));`);
		}

		if (allOperators.has("contains")) {
			cases.push(`case "contains":
				return values.some((value) => String(fieldValue).toLowerCase().includes(String(value).toLowerCase()));`);
		}

		if (allOperators.has("not_contains")) {
			cases.push(`case "not_contains":
				return !values.some((value) => String(fieldValue).toLowerCase().includes(String(value).toLowerCase()));`);
		}

		if (allOperators.has("starts_with")) {
			cases.push(`case "starts_with":
				return values.some((value) => String(fieldValue).toLowerCase().startsWith(String(value).toLowerCase()));`);
		}

		if (allOperators.has("ends_with")) {
			cases.push(`case "ends_with":
				return values.some((value) => String(fieldValue).toLowerCase().endsWith(String(value).toLowerCase()));`);
		}

		if (allOperators.has("equals")) {
			cases.push(`case "equals":
				return String(fieldValue) === String(values[0]);`);
		}

		if (allOperators.has("not_equals")) {
			cases.push(`case "not_equals":
				return String(fieldValue) !== String(values[0]);`);
		}

		// Number operators
		if (allOperators.has("greater_than")) {
			cases.push(`case "greater_than":
				return Number(fieldValue) > Number(values[0]);`);
		}

		if (allOperators.has("less_than")) {
			cases.push(`case "less_than":
				return Number(fieldValue) < Number(values[0]);`);
		}

		if (allOperators.has("greater_than_or_equal")) {
			cases.push(`case "greater_than_or_equal":
				return Number(fieldValue) >= Number(values[0]);`);
		}

		if (allOperators.has("less_than_or_equal")) {
			cases.push(`case "less_than_or_equal":
				return Number(fieldValue) <= Number(values[0]);`);
		}

		if (allOperators.has("between")) {
			cases.push(`case "between":
				if (values.length >= 2) {
					const min = Number(values[0]);
					const max = Number(values[1]);
					return Number(fieldValue) >= min && Number(fieldValue) <= max;
				}
				return true;`);
		}

		if (allOperators.has("not_between")) {
			cases.push(`case "not_between":
				if (values.length >= 2) {
					const min = Number(values[0]);
					const max = Number(values[1]);
					return Number(fieldValue) < min || Number(fieldValue) > max;
				}
				return true;`);
		}

		// Date operators
		if (allOperators.has("before")) {
			cases.push(`case "before":
				return new Date(String(fieldValue)) < new Date(String(values[0]));`);
		}

		if (allOperators.has("after")) {
			cases.push(`case "after":
				return new Date(String(fieldValue)) > new Date(String(values[0]));`);
		}

		// Universal operators
		if (allOperators.has("empty")) {
			cases.push(`case "empty":
				return fieldValue === null || fieldValue === undefined || String(fieldValue).trim() === "";`);
		}

		if (allOperators.has("not_empty")) {
			cases.push(`case "not_empty":
				return fieldValue !== null && fieldValue !== undefined && String(fieldValue).trim() !== "";`);
		}

		// Default case
		cases.push(`default:
				return true;`);

		return cases.join("\n\t\t\t");
	};

	const filteringLogic = `let filtered = [...data];
// Filter out empty filters before applying
const activeFilters = filters.filter((filter) => {
	const { operator, values } = filter;
	// Empty and not_empty operators don't require values
	if (operator === "empty" || operator === "not_empty") return true;
	// Check if filter has meaningful values
	if (!values || values.length === 0) return false;
	// For text/string values, check if they're not empty strings
	if (values.every((value) => typeof value === "string" && value.trim() === "")) return false;
	// For number values, check if they're not null/undefined
	if (values.every((value) => value === null || value === undefined)) return false;
	// For arrays, check if they're not empty
	if (values.every((value) => Array.isArray(value) && value.length === 0)) return false;
	return true;
});
activeFilters.forEach((filter) => {
	const { field, operator, values } = filter;
	filtered = filtered.filter((item) => {
		const fieldValue = item[field as keyof ${typeName}];
		switch (operator) {
			${generateSwitchCases()}
		}
	});
});
return filtered;`;

	return filteringLogic;
};
