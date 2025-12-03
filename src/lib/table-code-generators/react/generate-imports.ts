import type { TableBuilder } from "@/db-collections/table-builder.collections";

export const generateTableImports = (
	settings: TableBuilder["settings"],
	hasArrayColumns: boolean = false,
	hasFilterableColumns: boolean = false,
): Set<string> => {
	const importSet = new Set<string>();

	// Base imports always needed
	const reactImports = ["useMemo", "useState"];
	if (
		hasFilterableColumns ||
		settings.enableRowDragging ||
		settings.enableColumnDragging
	) {
		reactImports.push("useCallback");
	}
	importSet.add('import { Button } from "@/components/ui/button"');
	importSet.add('import { Badge } from "@/components/ui/badge"');
	importSet.add(`import { ${reactImports.join(", ")} } from "react"`);
	importSet.add(
		'import { EllipsisIcon , Settings2 , FunnelX} from "lucide-react"',
	);
	importSet.add(
		'import {\n\ttype ColumnDef,\n\tcreateColumnHelper,\n\tgetCoreRowModel,\n\tgetPaginationRowModel,\n\tgetSortedRowModel,\n\ttype PaginationState,\n\ttype SortingState,\n\tuseReactTable,\n} from "@tanstack/react-table"',
	);
	importSet.add(
		'import { DataGrid, DataGridContainer } from "@/components/ui/data-grid"',
	);
	importSet.add(
		'import { DataGridColumnVisibility } from "@/components/ui/data-grid-column-visibility"',
	);
	importSet.add(
		'import { DataGridColumnHeader } from "@/components/ui/data-grid-column-header"',
	);
	importSet.add(
		'import { DataGridTable } from "@/components/ui/data-grid-table"',
	);
	importSet.add(
		'import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"',
	);
	if (hasArrayColumns) {
		importSet.add('import { Badge } from "@/components/ui/badge"');
	}

	// Conditional imports based on settings
	if (settings.enablePagination) {
		importSet.add(
			'import { DataGridPagination } from "@/components/ui/data-grid-pagination"',
		);
	}

	if (settings.enableRowSelection) {
		importSet.add(
			'import {\n\tDataGridTableRowSelect,\n\tDataGridTableRowSelectAll,\n} from "@/components/ui/data-grid-table"',
		);
	}

	if (settings.enableCRUD) {
		importSet.add(
			'import {\n\tDropdownMenu,\n\tDropdownMenuContent,\n\tDropdownMenuGroup,\n\tDropdownMenuItem,\n\tDropdownMenuSeparator,\n\tDropdownMenuShortcut,\n\tDropdownMenuTrigger,\n} from "@/components/ui/dropdown-menu"',
		);
	}

	if (hasFilterableColumns) {
		importSet.add(
			'import { Filters, type Filter, type FilterFieldConfig } from "@/components/ui/filters"',
		);
	}

	if (settings.isGlobalSearch) {
		importSet.add('import { Input } from "@/components/ui/input"');
	}

	if (settings.enableRowDragging) {
		importSet.add(
			'import { DataGridTableDndRows } from "@/components/ui/data-grid-table"',
		);
	}

	if (settings.enableColumnDragging) {
		importSet.add(
			'import { DataGridTableDnd } from "@/components/ui/data-grid-table-dnd";',
		);
	}

	return importSet;
};

// Helper: Extract component names from a Set of import statements
export const extractTableImportDependencies = (
	importSet: Set<string>,
): { registryDependencies: string[]; dependencies: string[] } => {
	const registry = new Set<string>();
	const deps = new Set<string>();

	for (const stmt of importSet) {
		const fromMatch = stmt.match(/from\s+["']([^"']+)["']/);
		if (!fromMatch) continue;
		const modulePath = fromMatch[1];

		if (modulePath.startsWith("@/components/")) {
			const component = modulePath.split("/").pop();
			if (component) {
				// Map data-grid related components to @reui/data-grid-default
				if (component.startsWith("data-grid")) {
					registry.add("@reui/data-grid-default");
				}
				// Map filters to @reui/filters-default
				else if (component === "filters") {
					registry.add("@reui/filters-default");
				}
				// Keep other components as is
				else {
					registry.add(component);
				}
			}
		} else if (!modulePath.startsWith("./")) {
			deps.add(modulePath);
		}
	}

	return {
		registryDependencies: Array.from(registry),
		dependencies: Array.from(deps),
	};
};
