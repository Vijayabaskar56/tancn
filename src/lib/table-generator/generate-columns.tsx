import type { ColumnDef } from "@tanstack/react-table";
import { EllipsisIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataGridColumnHeader } from "@/components/ui/data-grid-column-header";
import {
	DataGridTableRowSelect,
	DataGridTableRowSelectAll,
} from "@/components/ui/data-grid-table";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { FilterFieldConfig } from "@/components/ui/filters";
import type { ColumnConfig, DataRow, JsonData } from "@/types/table-types";

interface ColumnSettings {
	enableSorting?: boolean;
	enableHiding?: boolean;
	enableResizing?: boolean;
	enablePinning?: boolean;
	enableRowSelection?: boolean;
	enableCRUD?: boolean;
}

// Row actions component
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
}

// Generate cell content based on column type
function renderCell(
	value: any,
	type: ColumnConfig["type"],
	columnId?: string,
	onToggleExpand?: (columnId: string, rowId: string) => void,
	expandedRows?: Set<string>,
) {
	switch (type) {
		case "string":
			return <div className="font-medium">{String(value || "")}</div>;
		case "number":
			return (
				<div>
					{typeof value === "number"
						? value.toLocaleString()
						: String(value || "")}
				</div>
			);
		case "boolean":
			return (
				<Badge>
					{typeof value === "boolean"
						? value
							? "YES"
							: "NO"
						: String(value || "")}
				</Badge>
			);
		case "date":
			if (value) {
				const date = new Date(value);
				return <div>{date.toLocaleDateString()}</div>;
			}
			return <div></div>;
		case "object":
			return (
				<div className="text-xs text-muted-foreground">
					{value ? JSON.stringify(value) : ""}
				</div>
			);
		case "array": {
			if (!Array.isArray(value)) {
				return <div>{String(value || "")}</div>;
			}

			const rowId = columnId ? `${columnId}-${JSON.stringify(value)}` : "";
			const isExpanded = expandedRows?.has(rowId) || false;
			const displayItems = isExpanded ? value : value.slice(0, 2);
			const hasMoreItems = value.length > 2;

			return (
				<div className="flex flex-wrap gap-1">
					{displayItems.map((item, index) => {
						const colors = [
							"border-blue-500",
							"border-green-500",
							"border-yellow-500",
							"border-purple-500",
							"border-pink-500",
							"border-indigo-500",
							"border-red-500",
							"border-orange-500",
							"border-teal-500",
							"border-cyan-500",
						];
						const colorIndex = index % colors.length;
						return (
							<Badge
								key={index}
								variant="outline"
								className={`text-xs ${colors[colorIndex]}`}
							>
								{String(item)}
							</Badge>
						);
					})}
					{hasMoreItems && (
						<Badge
							variant="outline"
							className="text-xs cursor-pointer hover:bg-secondary transition-colors"
							onClick={() => {
								if (onToggleExpand && columnId) {
									onToggleExpand(columnId, rowId);
								}
							}}
						>
							{isExpanded ? "−" : `+${value.length - 2}`}
						</Badge>
					)}
				</div>
			);
		}
		default:
			return <div>{String(value || "")}</div>;
	}
}

export function generateColumns(
	columns: ColumnConfig[],
	settings?: ColumnSettings,
	expandableOptions?: {
		expandedRows?: Set<string>;
		onToggleExpand?: (columnId: string, rowId: string) => void;
	},
): ColumnDef<JsonData>[] {
	const generatedColumns: ColumnDef<JsonData>[] = columns.map((col) => {
		const base = {
			id: col.id,
			accessorKey: col.accessor,
			header: ({ column }: { column: any }) => (
				<DataGridColumnHeader title={col.label} column={column} />
			),
			cell: ({ row }: { row: any }) =>
				renderCell(
					row.getValue(col.accessor),
					col.type,
					col.id,
					expandableOptions?.onToggleExpand,
					expandableOptions?.expandedRows,
				),
			size: 180, // Default size, can be customized
			enableSorting: settings?.enableSorting ?? true,
			enableHiding: settings?.enableHiding ?? true,
			enableResizing: settings?.enableResizing ?? true,
			enablePinning: settings?.enablePinning ?? true,
			meta: {
				type: col.type,
				filterable: col.filterable,
			},
		};

		if (col.type === "number") {
			return {
				...base,
				filterFn: (row: any, columnId: string, filterValue: unknown) => {
					if (!filterValue) return true;
					const [min, max] = filterValue as [number, number];
					const value = row.getValue(columnId) as number;
					return value >= min && value <= max;
				},
			};
		}

		return base;
	});

	const resultColumns: ColumnDef<JsonData>[] = [];

	// Conditionally add select column
	if (settings?.enableRowSelection) {
		const selectColumn: ColumnDef<JsonData> = {
			id: "select",
			header: () => <DataGridTableRowSelectAll />,
			cell: ({ row }) => <DataGridTableRowSelect row={row} />,
			size: 35,
			enableSorting: false,
			enableHiding: false,
			enableResizing: false,
			enablePinning: false,
			meta: {
				headerClassName: "my-3",
				cellClassName: "my-3",
			},
		};
		resultColumns.push(selectColumn);
	}

	// Add generated columns
	resultColumns.push(...generatedColumns);

	// Conditionally add actions column
	if (settings?.enableCRUD) {
		const actionsColumn: ColumnDef<JsonData> = {
			id: "actions",
			header: () => <span className="sr-only">Actions</span>,
			cell: ({ row }) => <RowActions row={row} />,
			size: 60,
			enableHiding: false,
			enableSorting: false,
			enableResizing: false,
			enablePinning: false,
		};
		resultColumns.push(actionsColumn);
	}

	return resultColumns;
}

/**
 * Generate filter field configurations for DataGrid filters based on table columns
 */
export function generateFilterFields(
	columns: ColumnConfig[],
	data?: DataRow[],
): FilterFieldConfig[] {
	return columns
		.filter((col) => col.filterable)
		.map((col) => {
			const baseConfig: FilterFieldConfig = {
				key: col.accessor,
				label: col.label,
				type:
					col.type === "string"
						? "text"
						: col.type === "number"
							? "number"
							: col.type === "boolean"
								? "boolean"
								: col.type === "date"
									? "date"
									: col.type === "enum"
										? "select"
										: col.type === "array"
											? "multiselect"
											: "text",
				placeholder: `Filter by ${col.label.toLowerCase()}...`,
			};

			// Add specific configurations based on column type
			if (col.type === "boolean") {
				baseConfig.onLabel = "True";
				baseConfig.offLabel = "False";
			}

			// For enum columns, generate options from data
			if (col.type === "enum" && data) {
				const uniqueValues = [
					...new Set(
						data.map((row) => String(row[col.id] || "")).filter((val) => val),
					),
				];
				baseConfig.options = uniqueValues.map((value) => ({
					label: value,
					value: value,
				}));
				// For enum fields with few options, disable search
				baseConfig.searchable = uniqueValues.length <= 5;
				// Set appropriate width for enum fields
				baseConfig.className = "w-[160px]";
			}

			// For array columns, generate options from all unique array items
			if (col.type === "array" && data) {
				const uniqueValues = [
					...new Set(
						data
							.flatMap((row) => {
								const value = row[col.id];
								return Array.isArray(value) ? value.map(String) : [];
							})
							.filter((val) => val),
					),
				];
				baseConfig.options = uniqueValues.map((value) => ({
					label: value,
					value: value,
				}));
				// Enable search for array fields since they can have many items
				baseConfig.searchable = true;
				// Set appropriate width for array fields
				baseConfig.className = "w-[200px]";
			}
			return baseConfig;
		});
}

/**
 * Apply filters to data based on column types and filter configurations
 */
export function applyFilters(
	data: JsonData[],
	filters: Array<{
		field: string;
		operator: string;
		values: unknown[];
	}>,
	columns: ColumnConfig[],
): JsonData[] {
	let filtered = [...data];

	// Filter out empty filters before applying
	const activeFilters = filters.filter((filter) => {
		const { operator, values } = filter;

		// Empty and not_empty operators don't require values
		if (operator === "empty" || operator === "not_empty") return true;

		// Check if filter has meaningful values
		if (!values || values.length === 0) return false;

		// For text/string values, check if they're not empty strings
		if (
			values.every((value) => typeof value === "string" && value.trim() === "")
		)
			return false;

		// For number values, check if they're not null/undefined
		if (values.every((value) => value === null || value === undefined))
			return false;

		// For arrays, check if they're not empty
		if (values.every((value) => Array.isArray(value) && value.length === 0))
			return false;

		return true;
	});

	activeFilters.forEach((filter) => {
		const { field, operator, values } = filter;

		// Find the column type for this field
		const column = columns.find((col) => col.accessor === field);
		const columnType = column?.type || "string";

		filtered = filtered.filter((item) => {
			const fieldValue = item[field];

			switch (operator) {
				case "is_any_of":
					if (columnType === "array" && Array.isArray(fieldValue)) {
						// For multiselect on array columns, check if any selected values are in the array
						return values.some((selectedValue) =>
							fieldValue.includes(String(selectedValue)),
						);
					}
					return values.some((value) => String(value) === String(fieldValue));
				case "is_not_any_of":
					if (columnType === "array" && Array.isArray(fieldValue)) {
						// For multiselect on array columns, check if none of the selected values are in the array
						return !values.some((selectedValue) =>
							fieldValue.includes(String(selectedValue)),
						);
					}
					return !values.some((value) => String(value) === String(fieldValue));
				case "includes_all":
					if (columnType === "array" && Array.isArray(fieldValue)) {
						// For array columns, check if all selected values are in the array
						return values.every((selectedValue) =>
							fieldValue.includes(String(selectedValue)),
						);
					}
					return false; // includes_all only makes sense for arrays
				case "excludes_all":
					if (columnType === "array" && Array.isArray(fieldValue)) {
						// For array columns, check if none of the selected values are in the array
						return !values.some((selectedValue) =>
							fieldValue.includes(String(selectedValue)),
						);
					}
					return true; // excludes_all only makes sense for arrays
				case "is":
					return values.some((value) => String(value) === String(fieldValue));
				case "is_not":
					return !values.some((value) => String(value) === String(fieldValue));
				case "contains":
					return values.some((value) =>
						String(fieldValue)
							.toLowerCase()
							.includes(String(value).toLowerCase()),
					);
				case "not_contains":
					return !values.some((value) =>
						String(fieldValue)
							.toLowerCase()
							.includes(String(value).toLowerCase()),
					);
				case "starts_with":
					return values.some((value) =>
						String(fieldValue)
							.toLowerCase()
							.startsWith(String(value).toLowerCase()),
					);
				case "ends_with":
					return values.some((value) =>
						String(fieldValue)
							.toLowerCase()
							.endsWith(String(value).toLowerCase()),
					);
				case "equals":
					return String(fieldValue) === String(values[0]);
				case "not_equals":
					return String(fieldValue) !== String(values[0]);
				case "greater_than":
					return Number(fieldValue) > Number(values[0]);
				case "less_than":
					return Number(fieldValue) < Number(values[0]);
				case "greater_than_or_equal":
					return Number(fieldValue) >= Number(values[0]);
				case "less_than_or_equal":
					return Number(fieldValue) <= Number(values[0]);
				case "between":
					if (values.length >= 2) {
						const min = Number(values[0]);
						const max = Number(values[1]);
						return Number(fieldValue) >= min && Number(fieldValue) <= max;
					}
					return true;
				case "not_between":
					if (values.length >= 2) {
						const min = Number(values[0]);
						const max = Number(values[1]);
						return Number(fieldValue) < min || Number(fieldValue) > max;
					}
					return true;
				case "before":
					return new Date(String(fieldValue)) < new Date(String(values[0]));
				case "after":
					return new Date(String(fieldValue)) > new Date(String(values[0]));
				case "empty":
					return (
						fieldValue === null ||
						fieldValue === undefined ||
						String(fieldValue).trim() === ""
					);
				case "not_empty":
					return (
						fieldValue !== null &&
						fieldValue !== undefined &&
						String(fieldValue).trim() !== ""
					);
				default:
					return true;
			}
		});
	});

	return filtered;
}

import { detectColumnsConfig } from "@/lib/column-detection";

export const detectColumns = (data: JsonData[]) => detectColumnsConfig(data);
