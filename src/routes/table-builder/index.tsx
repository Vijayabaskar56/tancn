import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import { DataGrid, DataGridContainer } from "@/components/ui/data-grid";
import { DataGridColumnVisibility } from "@/components/ui/data-grid-column-visibility";
import { DataGridPagination } from "@/components/ui/data-grid-pagination";
import { DataGridTable } from "@/components/ui/data-grid-table";
import { DataGridTableDnd } from "@/components/ui/data-grid-table-dnd";
import {
	DataGridTableDndRowHandle,
	DataGridTableDndRows,
} from "@/components/ui/data-grid-table-dnd-rows";
import { type Filter, Filters } from "@/components/ui/filters";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import useTableStore from "@/hooks/use-table-store";
import {
	applyFilters,
	generateColumns,
	generateFilterFields,
} from "@/lib/table-generator/generate-columns";
import { TableBuilderService } from "@/services/table-builder.service";
import type { JsonData } from "@/types/table-types";
import { cn } from "@/utils/utils";
import type { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { createFileRoute } from "@tanstack/react-router";
import {
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type PaginationState,
	type SortingState,
	useReactTable,
	type VisibilityState,
} from "@tanstack/react-table";
import { CircleX, ListFilter, Settings2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
export const Route = createFileRoute("/table-builder/")({
	head: () => ({
		meta : [],
	}),
	validateSearch : () => ({
		//TODO: add url filtering validation
	 }),
	component: RouteComponent,
	pendingComponent: Loader,
});

function RouteComponent() {
	const tableData = useTableStore();
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});

	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
	const [columnOrder, setColumnOrder] = useState<string[]>([]);
	const [globalFilter, setGlobalFilter] = useState("");
	const [filters, setFilters] = useState<Filter[]>([]);
	const [dataVersion, setDataVersion] = useState(0);
	const [expandedArrayRows, setExpandedArrayRows] = useState<Set<string>>(
		new Set(),
	);

	const handleToggleArrayExpand = useCallback(
		(_columnId: string, rowId: string) => {
			setExpandedArrayRows((prev) => {
				const newSet = new Set(prev);
				if (newSet.has(rowId)) {
					newSet.delete(rowId);
				} else {
					newSet.add(rowId);
				}
				return newSet;
			});
		},
		[],
	);

	const columns = useMemo(() => {
		// Ensure the first string column is filterable
		const modifiedColumns = tableData.table.columns.map((col, index) => {
			if (
				col.type === "string" &&
				index === tableData.table.columns.findIndex((c) => c.type === "string")
			) {
				return { ...col, filterable: true };
			}
			return col;
		});

		let finalColumns = generateColumns(modifiedColumns, tableData.settings, {
			expandedRows: expandedArrayRows,
			onToggleExpand: handleToggleArrayExpand,
		});
		// Add drag handle column if row dragging is enabled
		if (tableData.settings.enableRowDragging) {
			finalColumns = [
				{
					id: "drag",
					cell: ({ row }) => <DataGridTableDndRowHandle rowId={row.id} />,
					size: 40,
					enableSorting: false,
					enableHiding: false,
				},
				...finalColumns,
			];
		}

		return finalColumns;
	}, [
		tableData.table.columns,
		tableData.settings,
		expandedArrayRows,
		handleToggleArrayExpand,
	]);

	const filterFields = useMemo(() => {
		return generateFilterFields(
			tableData.table.columns,
			tableData.table.data as JsonData[],
		);
	}, [tableData.table.columns, tableData.table.data]);
	// Apply filters to data
	const filteredData = useMemo(() => {
		return applyFilters(
			tableData.table.data as JsonData[],
			filters,
			tableData.table.columns,
		);
	}, [tableData.table.data, filters, tableData.table.columns]);
	// Row dragging state
	const dataIds = useMemo(() => {
		return filteredData.map((item) =>
			tableData.table.data.indexOf(item).toString(),
		);
	}, [filteredData, tableData.table.data]);

	// Update page size when pagination setting changes
	useEffect(() => {
		if (!tableData.settings.enablePagination) {
			setPagination({ pageIndex: 0, pageSize: filteredData.length });
		} else {
			setPagination({ pageIndex: 0, pageSize: 10 });
		}
	}, [tableData, filteredData.length]);

	useEffect(() => {
		setColumnOrder(columns.map((column) => column.id || ""));
	}, [columns]);

	useEffect(() => {
		setDataVersion((v) => v + 1);
	}, []);

	useEffect(() => {
		const maxPage = Math.max(
			0,
			Math.ceil(filteredData.length / pagination.pageSize) - 1,
		);
		if (pagination.pageIndex > maxPage) {
			setPagination((prev) => ({ ...prev, pageIndex: maxPage }));
		}
	}, [filteredData.length, pagination.pageSize, pagination.pageIndex]);

	const handleFiltersChange = useCallback((newFilters: Filter[]) => {
		setFilters(newFilters);
		// Reset pagination when filters change
		setPagination((prev) => ({ ...prev, pageIndex: 0 }));
	}, []);

	const table = useReactTable({
		data: filteredData,
		columns,
		columnResizeMode: "onChange",
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		onSortingChange: setSorting,
		enableSorting: true,
		enableSortingRemoval: false,
		getPaginationRowModel: getPaginationRowModel(),
		onPaginationChange: setPagination,
		onColumnVisibilityChange: setColumnVisibility,
		onGlobalFilterChange: setGlobalFilter,
		getFilteredRowModel: getFilteredRowModel(),
		enableColumnPinning: true,
		enableColumnResizing: true,
		enableRowSelection: tableData.settings.enableRowSelection,
		state: {
			sorting,
			pagination,
			columnVisibility,
			columnOrder,
			globalFilter,
		},
		onColumnOrderChange: setColumnOrder,
		pageCount: Math.ceil((filteredData.length || 0) / pagination.pageSize),
	});

	const handleDragEnd = useCallback((event: DragEndEvent) => {
		const { active, over } = event;
		if (active && over && active.id !== over.id) {
			// Only allow reordering of draggable columns (not select or actions)
			const isActiveDraggable =
				active.id !== "select" && active.id !== "actions";
			const isOverDraggable = over.id !== "select" && over.id !== "actions";

			if (isActiveDraggable && isOverDraggable) {
				setColumnOrder((columnOrder) => {
					const oldIndex = columnOrder.indexOf(active.id as string);
					const newIndex = columnOrder.indexOf(over.id as string);
					return arrayMove(columnOrder, oldIndex, newIndex);
				});
			}
		}
	}, []);

	const handleRowDragEnd = useCallback(
		(event: DragEndEvent) => {
			const { active, over } = event;
			if (active && over && active.id !== over.id) {
				const oldIndex = dataIds.indexOf(active.id as string);
				const newIndex = dataIds.indexOf(over.id as string);
				const newData = arrayMove(
					[...tableData.table.data],
					oldIndex,
					newIndex,
				);
				TableBuilderService.updateData(newData);
			}
		},
		[dataIds, tableData.table.data],
	);
	return (
		<div className="m-6">
			<div className="w-full space-y-4 h-full overflow-auto">
				{/* Filters */}

				<div className="flex flex-wrap items-start gap-2.5 mb-3.5">
					<div>
						{tableData.settings.isGlobalSearch &&
						<Input
						// id={`${id}-input`}
						// ref={inputRef}
						className={cn(
							"peer min-w-60 h-8",
							Boolean(table.getState().globalFilter) && "pe-9",
						)}
						value={(table.getState().globalFilter ?? "") as string}
						onChange={(e) => table.setGlobalFilter(e.target.value)}
						placeholder="Search all columns..."
						type="text"
						aria-label="Search all columns"
						/>
					}
					</div>
					<div className="flex items-center gap-3">
						{tableData.settings.enableHiding &&
							tableData.table.columns.length > 0 && (
								<DataGridColumnVisibility
									table={table}
									trigger={<Button variant="outline" size='sm'>
										<Settings2 />
										View
										</Button>}
								/>
							)}
					</div>
					<div className="flex-1">
						<Filters
							filters={filters}
							fields={filterFields}
							onChange={handleFiltersChange}
							variant="outline"
							addButton={<Button variant="outline" size='sm'>
										<ListFilter />
										Filter
										</Button>

							}
						/>
					</div>
					{filters.length > 0 && (
						<Button variant="outline" size="sm" onClick={() => setFilters([])}>
							<CircleX /> Clear
						</Button>
					)}
				</div>

				{/* Data Grid */}
				{/* key forces re-mount of DataGrid when data or pagination changes, ensuring UI updates immediately despite React Compiler memoization */}
				<DataGrid
					key={`${dataVersion}-${pagination.pageIndex}-${pagination.pageSize}`}
					table={table}
					recordCount={filteredData.length}
					tableLayout={{
						dense: tableData.settings.tableLayout?.dense ?? false,
						cellBorder: tableData.settings.tableLayout?.cellBorder ?? false,
						rowBorder: tableData.settings.tableLayout?.rowBorder ?? true,
						rowRounded: tableData.settings.tableLayout?.rowRounded ?? false,
						stripped: tableData.settings.tableLayout?.stripped ?? false,
						headerBorder: tableData.settings.tableLayout?.headerBorder ?? true,
						headerSticky: tableData.settings.tableLayout?.headerSticky ?? false,
						columnsMovable: tableData.settings.enableColumnMovable ?? false,
						columnsResizable: tableData.settings.enableResizing ?? false,
						columnsVisibility: tableData.settings.enableHiding ?? false,
						columnsPinnable: tableData.settings.enablePinning ?? false,
						columnsDraggable: tableData.settings.enableColumnDragging ?? false,
						rowsDraggable: tableData.settings.enableRowDragging ?? false,
					}}
				>
					<div className="space-y-2.5">
						<DataGridContainer>
							<ScrollArea>
								{tableData.settings.enableRowDragging ? (
									<DataGridTableDndRows
										handleDragEnd={handleRowDragEnd}
										dataIds={dataIds}
									/>
								) : tableData.settings.enableColumnDragging ? (
									<DataGridTableDnd handleDragEnd={handleDragEnd} />
								) : (
									<DataGridTable />
								)}
								<ScrollBar orientation="horizontal" />
							</ScrollArea>
						</DataGridContainer>
						{tableData.settings.enablePagination &&
							tableData.table.data.length > 0 && <DataGridPagination  />}
					</div>
				</DataGrid>
				<div className="text-center text-sm text-muted-foreground mt-4">
					Table builder powered by{" "}
					<a
						href="https://www.reui.io/docs/data-grid"
						target="_blank"
						className="underline hover:no-underline"
					>DataGrid</a>
					{" "}&{" "}
					<a
						href="https://www.reui.io/docs/filters"
						target="_blank"
						className="underline hover:no-underline"
					>Filter
					</a>
					{" "}Components from {" "}
					<a
						href="https://www.reui.io/"
						target="_blank"
						className="underline hover:no-underline"
					>
						ReUI Components
					</a>
				</div>
			</div>
		</div>
	);
}
