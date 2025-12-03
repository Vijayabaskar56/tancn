// @ts-nocheck
import type { TableBuilder } from "@/db-collections/table-builder.collections";
import { generateFilterFields } from "@/lib/table-generator/generate-columns";
import type { JsonData } from "@/types/table-types";
import { capitalize, toCamelCase, toJSLiteral } from "@/utils/utils";
import {
	getColumnsString,
	getFilteredDataString,
} from "./generate-coloum-code";

const getDataName = (customName?: string): string => {
	return customName ? `${customName}Data` : "tableData";
};

const getTypeName = (customName?: string): string => {
	return customName ? `${capitalize(customName)}Data` : "TableData";
};

const getComponentName = (tableName: string, customName?: string): string => {
	return customName
		? `${capitalize(customName)}Table`
		: `${capitalize(tableName)}Table`;
};

const generateTableLayoutProps = (tableData: TableBuilder): string => {
	const props: Record<string, any> = {};

	if (tableData.settings.tableLayout?.dense) {
		props.dense = true;
	}
	if (tableData.settings.tableLayout?.cellBorder) {
		props.cellBorder = true;
	}
	if (tableData.settings.tableLayout?.rowBorder) {
		props.rowBorder = true;
	}
	if (tableData.settings.tableLayout?.rowRounded) {
		props.rowRounded = true;
	}
	if (tableData.settings.tableLayout?.stripped) {
		props.stripped = true;
	}
	if (tableData.settings.tableLayout?.headerBorder) {
		props.headerBorder = true;
	}
	if (tableData.settings.tableLayout?.headerSticky) {
		props.headerSticky = true;
	}
	if (tableData.settings.tableLayout?.width) {
		props.width = tableData.settings.tableLayout.width;
	}

	if (tableData.settings.enableColumnDragging) {
		props.columnsDraggable = true;
	}
	if (tableData.settings.enableRowDragging) {
		props.rowsDraggable = true;
	}
	if (tableData.settings.enableColumnMovable) {
		props.columnsMovable = true;
	}
	if (tableData.settings.enableResizing) {
		props.columnsResizable = true;
	}
	if (tableData.settings.enablePinning) {
		props.columnsPinnable = true;
	}
	if (tableData.settings.enableHiding) {
		props.columnsVisibility = true;
	}
	return Object.keys(props).length > 0
		? ` tableLayout={${toJSLiteral(props)}}`
		: "";
};

const generateFilterFieldsCode = (
	tableData: TableBuilder,
	dataName: string,
	typeName: string,
): string => {
	// Check if any column has filterable enabled
	const hasFilterableColumns = tableData.table.columns.some(
		(col) => col.filterable === true,
	);
	if (!hasFilterableColumns) return "";

	const modifiedDataFormat = tableData.table.columns.map((col) => ({
		...col,
		accessor: toCamelCase(col.label),
		label: toCamelCase(col.label),
	}));

	const generatedFields = generateFilterFields(
		modifiedDataFormat,
		tableData.table.data as JsonData[],
	);
	const fieldsCode = generatedFields
		.map(
			(field) =>
				`{ ${Object.entries(field)
					.map(([k, v]) => `${k}: ${toJSLiteral(v)}`)
					.join(", ")} }`,
		)
		.join(",");

	const filteringCode = getFilteredDataString(
		tableData.table.columns,
		typeName,
	);

	return `const filterFields = useMemo<FilterFieldConfig[]>(() => [
		${fieldsCode}
	], []);
	// Apply filters to data
	const filteredData = useMemo(() => {
		const data = ${toCamelCase(dataName)};
		${filteringCode}
	}, [filters, ${toCamelCase(dataName)}]);`;
};

export const generateTableCode = (
	tableData: TableBuilder,
	customName?: string,
): { file: string; code: string } => {
	const componentName = getComponentName(tableData.tableName, customName);
	const dataName = getDataName(customName);
	const typeName = getTypeName(customName);
	const FilterCode = generateFilterFieldsCode(tableData, dataName, typeName);

	// Check if any column has filterable enabled
	const hasFilterableColumns = tableData.table.columns.some(
		(col) => col.filterable === true,
	);

	const dataVar = hasFilterableColumns ? "filteredData" : toCamelCase(dataName);

	const componentBody =
		`export default function ${capitalize(componentName)}() {
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});
	const [sorting, setSorting] = useState<SortingState>([]);
	${hasFilterableColumns ? "const [filters, setFilters] = useState<Filter[]>([]);" : ""}
	${
		tableData.table.columns.some((col) => col.type === "array")
			? `const [expandedArrayRows, setExpandedArrayRows] = useState<Set<string>>(new Set());
	const handleToggleArrayExpand = useCallback((columnId: string, rowId: string) => {
		setExpandedArrayRows((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(rowId)) {
				newSet.delete(rowId);
			} else {
				newSet.add(rowId);
			}
			return newSet;
		});
	}, []);`
			: ""
	}
	${
		tableData.settings.enableRowDragging
			? `const dataIds = useMemo(() => ${dataVar}.map((item) => item.id), [${dataVar}]);
	const handleRowDragEnd = useCallback((event: any) => {
		// Handle row drag end
	}, []);`
			: ""
	}
	${
		tableData.settings.enableColumnDragging
			? `const handleDragEnd = useCallback((event: DragEndEvent) => {
		 const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setColumnOrder((columnOrder) => {
        const oldIndex = columnOrder.indexOf(active.id as string);
        const newIndex = columnOrder.indexOf(over.id as string);
        return arrayMove(columnOrder, oldIndex, newIndex);
      });
    }
	}, []);`
			: ""
	}

	${getColumnsString(
		tableData.table.columns,
		{
			enableSorting: tableData.settings.enableSorting,
			enableHiding: tableData.settings.enableHiding,
			enableResizing: tableData.settings.enableResizing,
			enablePinning: tableData.settings.enablePinning,
			enableRowSelection: tableData.settings.enableRowSelection,
			enableCRUD: tableData.settings.enableCRUD,
		},
		`${typeName}`,
	)}

	${
		hasFilterableColumns
			? `${FilterCode}
	const handleFiltersChange = useCallback((filters: Filter[]) => {
		setFilters(filters);
		setPagination((prev) => ({ ...prev, pageIndex: 0 }));
	}, []);`
			: ""
	}
	const table = useReactTable({
		columns,
		data: ${dataVar},
		pageCount: Math.ceil((${dataVar}?.length || 0) / pagination.pageSize),
		state: {
			pagination,
			sorting,
		},
		enableSorting: ${tableData.settings.enableSorting},
		enableSortingRemoval: false,
		onPaginationChange: setPagination,
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});
	return (
		<DataGrid table={table} recordCount={` +
		dataVar +
		`?.length || 0}` +
		generateTableLayoutProps(tableData) +
		`>
			<div className="w-full space-y-2.5">
			` +
		(tableData.settings.isGlobalSearch
			? `
					<div>
						<Input
							className="peer min-w-60 h-8"
							value={(table.getState().globalFilter ?? "") as string}
							onChange={(e) => table.setGlobalFilter(e.target.value)}
							placeholder="Search all columns..."
							type="text"
							aria-label="Search all columns"
						/>
					</div>
					`
			: "") +
		(tableData.settings.enableHiding && tableData.table.columns.length > 0
			? `
					<div className="flex items-center gap-3">
						<DataGridColumnVisibility
							table={table}
							trigger={<Button variant="outline" size='sm'><Settings2 />View</Button>}
						/>
					</div>
					`
			: "") +
		`
			` +
		(hasFilterableColumns
			? `<div className="flex-1"><Filters
					filters={filters}
					fields={filterFields}
					variant="outline"
					onChange={handleFiltersChange}
				/></div>
				{filters.length > 0 && (
					<Button variant="outline" onClick={() => setFilters([])}>
						<FunnelX /> Clear
					</Button>
				)}`
			: "") +
		`
				<DataGridContainer>
					<ScrollArea>
						${
							tableData.settings.enableRowDragging
								? `<DataGridTableDndRows
							handleDragEnd={handleRowDragEnd}
							dataIds={dataIds}
						/>`
								: tableData.settings.enableColumnDragging
									? `<DataGridTableDnd handleDragEnd={handleDragEnd} />`
									: `<DataGridTable />`
						}
						<ScrollBar orientation="horizontal" />
					</ScrollArea>
				</DataGridContainer>
				` +
		(tableData.settings.enablePagination ? "<DataGridPagination />" : "") +
		`
			</div>
		</DataGrid>
	);
};`;

	const componentCodeWithImport = `import { ${toCamelCase(dataName)} } from './data';
${componentBody}`;

	return {
		file: `${componentName.toLowerCase()}.tsx`,
		code: componentCodeWithImport,
	};
};
