import { useLiveQuery } from "@tanstack/react-db";
import { tableBuilderCollection } from "@/db-collections/table-builder.collections";
import { createIsomorphicFn } from "@tanstack/react-start";
import { DEFAULT_TABLE_COLUMNS, DEFAULT_TABLE_DATA } from "@/constants/default-table-data";

const defaultTableState = {
	tableName: "draft",
	settings: {
		isGlobalSearch: false,
		enableHiding: false,
		enableSorting: false,
		enableResizing: false,
		enablePinning: false,
		enableRowSelection: false,
		enableCRUD: false,
		enableColumnDragging: false,
		enableRowDragging: false,
		enablePagination: false,
		enableColumnMovable : false,
		enableUrlFiltering: false,
		tableLayout: {
			dense: false,
			cellBorder: false,
			rowBorder: true,
			rowRounded: false,
			stripped: false,
			headerBorder: true,
			headerSticky: false,
			width: "auto",
		},
	},
	table: {
		columns: DEFAULT_TABLE_COLUMNS,
		data: DEFAULT_TABLE_DATA,
	},
};

const useTableStore = createIsomorphicFn().server(() => {
	return defaultTableState;
}).client(() => {

	const { data } = useLiveQuery((q) =>
		q
			.from({ tableBuilder: tableBuilderCollection })
			.select(({ tableBuilder }) => ({
				tableName: tableBuilder.tableName,
				settings: tableBuilder.settings,
				table: tableBuilder.table,
			})),
	);

	return (
		data?.[0] || defaultTableState
	);
})
export default useTableStore;
