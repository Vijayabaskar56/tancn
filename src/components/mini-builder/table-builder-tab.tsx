import { ChevronDown, GripVertical, Plus } from "lucide-react";
import { Reorder, useDragControls } from "motion/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DeleteIcon } from "@/components/ui/delete";
import { cn } from "@/utils/utils";

type ColumnType = "string" | "number" | "boolean" | "date" | "enum";

type Column = {
	id: string;
	accessor: string;
	label: string;
	type: ColumnType;
	order: number;
};

type TableData = Record<string, any>;

const initialColumns: Column[] = [
	{ id: "1", accessor: "name", label: "Name", type: "string", order: 0 },
	{ id: "2", accessor: "email", label: "Email", type: "string", order: 1 },
	{ id: "3", accessor: "status", label: "Status", type: "enum", order: 2 },
	{ id: "4", accessor: "joined", label: "Joined", type: "date", order: 3 },
];

const initialData: TableData[] = [
	{
		name: "John Doe",
		email: "john@example.com",
		status: "active",
		joined: "2024-01-15",
	},
	{
		name: "Jane Smith",
		email: "jane@example.com",
		status: "inactive",
		joined: "2024-02-20",
	},
	{
		name: "Bob Johnson",
		email: "bob@example.com",
		status: "active",
		joined: "2024-03-10",
	},
];

function ColumnItem({
	column,
	onDelete,
}: {
	column: Column;
	onDelete: (id: string) => void;
}) {
	const dragControls = useDragControls();

	return (
		<Reorder.Item
			value={column}
			id={column.id}
			dragListener={false}
			dragControls={dragControls}
			className="relative group bg-card border border-border rounded-lg mb-2 overflow-hidden"
		>
			<div className="flex items-center p-3 gap-3">
				<div
					className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded touch-none text-muted-foreground hover:text-foreground transition-colors"
					onPointerDown={(e) => dragControls.start(e)}
				>
					<GripVertical size={16} />
				</div>
				<div className="flex-1 min-w-0">
					<div className="font-medium text-sm truncate">{column.label}</div>
					<div className="text-xs text-muted-foreground">
						{column.accessor} ({column.type})
					</div>
				</div>
				<Button
					variant="ghost"
					size="icon"
					className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
					onClick={() => onDelete(column.id)}
				>
					<DeleteIcon size={16} />
				</Button>
				<div className="opacity-0 group-hover:opacity-100 transition-opacity">
					<ChevronDown size={16} className="text-muted-foreground" />
				</div>
			</div>
		</Reorder.Item>
	);
}

function TablePreview({
	columns,
	data,
}: {
	columns: Column[];
	data: TableData[];
}) {
	const sortedColumns = [...columns].sort((a, b) => a.order - b.order);

	return (
		<div className="w-full overflow-auto custom-scrollbar">
			<div className="min-w-full inline-block align-middle">
				<div className="overflow-hidden border border-border rounded-lg">
					<table className="min-w-full divide-y divide-border">
						<thead className="bg-muted/50">
							<tr>
								{sortedColumns.map((column) => (
									<th
										key={column.id}
										className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
									>
										{column.label}
									</th>
								))}
							</tr>
						</thead>
						<tbody className="bg-background divide-y divide-border">
							{data.map((row, rowIndex) => (
								<tr
									key={rowIndex}
									className="hover:bg-muted/30 transition-colors"
								>
									{sortedColumns.map((column) => (
										<td
											key={column.id}
											className="px-4 py-3 text-sm text-foreground whitespace-nowrap"
										>
											{row[column.accessor] !== undefined
												? String(row[column.accessor])
												: "-"}
										</td>
									))}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}

export function TableBuilderTab() {
	const [columns, setColumns] = useState<Column[]>(initialColumns);
	const [data] = useState<TableData[]>(initialData);
	const [activeTab, setActiveTab] = useState<"columns" | "preview">("columns");

	const handleAddColumn = () => {
		const newColumn: Column = {
			id: Math.random().toString(36).substr(2, 9),
			accessor: `column_${columns.length + 1}`,
			label: `Column ${columns.length + 1}`,
			type: "string",
			order: columns.length,
		};
		setColumns([...columns, newColumn]);
	};

	const handleDeleteColumn = (id: string) => {
		setColumns(columns.filter((col) => col.id !== id));
	};

	const handleReorderColumns = (newColumns: Column[]) => {
		const reordered = newColumns.map((col, index) => ({
			...col,
			order: index,
		}));
		setColumns(reordered);
	};

	return (
		<div className="flex-1 flex overflow-hidden relative h-full">
			{/* Mobile Tab Navigation */}
			<div className="lg:hidden absolute top-0 left-0 right-0 z-30 flex border-b border-border bg-muted/10">
				<button
					type="button"
					onClick={() => setActiveTab("columns")}
					className={cn(
						"flex-1 py-2 text-sm font-medium transition-colors relative",
						activeTab === "columns"
							? "text-primary bg-background"
							: "text-muted-foreground hover:bg-muted/20",
					)}
				>
					Columns
					{activeTab === "columns" && (
						<div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
					)}
				</button>
				<button
					type="button"
					onClick={() => setActiveTab("preview")}
					className={cn(
						"flex-1 py-2 text-sm font-medium transition-colors relative",
						activeTab === "preview"
							? "text-primary bg-background"
							: "text-muted-foreground hover:bg-muted/20",
					)}
				>
					Preview
					{activeTab === "preview" && (
						<div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
					)}
				</button>
			</div>

			{/* Left Column: Column List */}
			<div
				className={cn(
					"border-r border-border bg-card/50 flex flex-col transition-all duration-300 pt-10 lg:pt-0",
					"lg:w-64 lg:relative lg:flex",
					activeTab === "columns"
						? "w-full absolute inset-y-0 left-0 z-10 lg:static lg:w-64"
						: "hidden lg:flex",
				)}
			>
				<div className="p-4 border-b border-border flex items-center justify-between">
					<div>
						<h3 className="font-semibold text-primary">Columns</h3>
						<p className="text-xs text-muted-foreground">
							Add columns to your table
						</p>
					</div>
				</div>
				<div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
					<Button
						onClick={handleAddColumn}
						variant="outline"
						size="sm"
						className="w-full"
					>
						<Plus className="w-4 h-4 mr-2" />
						Add Column
					</Button>
					<Reorder.Group
						axis="y"
						values={columns}
						onReorder={handleReorderColumns}
						className="space-y-2 mt-4"
					>
						{columns.map((column) => (
							<ColumnItem
								key={column.id}
								column={column}
								onDelete={handleDeleteColumn}
							/>
						))}
					</Reorder.Group>
				</div>
			</div>

			{/* Right Column: Table Preview */}
			<div
				className={cn(
					"bg-background flex flex-col transition-all duration-300 pt-10 lg:pt-0",
					"lg:flex-1 lg:relative lg:flex",
					activeTab === "preview"
						? "absolute inset-0 z-20 lg:static"
						: "hidden lg:flex",
				)}
			>
				<div className="p-4 border-b border-border">
					<h3 className="font-semibold text-primary">Preview</h3>
					<p className="text-xs text-muted-foreground">Live table preview</p>
				</div>
				<div className="flex-1 overflow-auto p-4 md:p-6 custom-scrollbar">
					<TablePreview columns={columns} data={data} />
				</div>
			</div>
		</div>
	);
}
