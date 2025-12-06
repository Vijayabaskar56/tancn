import {
	closestCenter,
	DndContext,
	type DragOverEvent,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { LucideGripVertical } from "lucide-react";
import { useEffect, useOptimistic, useState, useTransition } from "react";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { DeleteIcon } from "@/components/ui/delete";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppForm } from "@/components/ui/tanstack-form";
import type { TableBuilder } from "@/db-collections/table-builder.collections";
import { useForcedTransition } from "@/hooks/use-force-transition";
import useTableStore from "@/hooks/use-table-store";
import { addColumn, updateColumn, deleteColumn, reorderColumns, addColumnData } from "@/services/table-builder.service";

import type { ColumnConfig } from "@/types/table-types";
import { Badge } from "../ui/badge";
import { Checkbox } from "../ui/checkbox";
import { ScrollArea } from "../ui/scroll-area";
import { TableColumnDropdown } from "./table-column-dropdown";

export function TableColumnEdit() {
	const [localColumns, setLocalColumns] = useState<ColumnConfig[]>([]);

	// Get the current table data using the store
	const tableData = useTableStore();

	const [optimisticColumns, setOptimisticColumns] = useOptimistic(localColumns);
	const sortingTransition = useForcedTransition();
	const [, startSaveTransition] = useTransition();
	const [openAccordions, setOpenAccordions] = useState<Map<string, boolean>>(
		new Map(),
	);

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	useEffect(() => {
		if (tableData) {
			setLocalColumns(tableData.table.columns);
		}
	}, [tableData]);

	if (!tableData) {
		return <div>No table data found</div>;
	}

	const columns = tableData.table.columns;
	const handleUpdateColumn = (
		columnId: string,
		updates: Partial<(typeof columns)[0]>,
	) => {
		updateColumn(columnId, updates);
	};
	const handleDeleteColumn = (columnId: string) => {
		deleteColumn(columnId);
	};

	const handleReorderColumns = (newOrder: typeof columns) => {
		reorderColumns(newOrder);
		setLocalColumns(newOrder);
	};

	const handleAddColumn = (type: string) => {
		addColumn(type as TableBuilder["table"]["columns"][0]["type"]);
		addColumnData();
	};

	function handleDragStart() {
		sortingTransition.start();
	}

	function handleDragEnd() {
		sortingTransition.stop();
		startSaveTransition(async () => {
			handleReorderColumns(optimisticColumns);
		});
	}

	function handleDragOver(event: DragOverEvent) {
		const { active, over } = event;
		if (active.id !== over?.id) {
			const oldIndex = optimisticColumns.findIndex(
				(item) => item.id === active.id,
			);
			const newIndex = optimisticColumns.findIndex(
				(item) => item.id === over?.id,
			);
			const newOrder = arrayMove(optimisticColumns, oldIndex, newIndex);
			setOptimisticColumns(newOrder);
		}
	}

	function handleDragCancel() {
		sortingTransition.stop();
	}

	return (
		<div className="w-full h-full flex flex-col gap-4">
			<div className="flex-none p-4 border-b">
				<h3 className="text-lg font-semibold text-primary">Columns</h3>
				<p className="text-sm text-muted-foreground">
					Add Columns to Your Table
				</p>
			</div>
			<div className="flex-none flex items-center justify-between px-4">
				<Label className="text-sm font-medium">Table Columns</Label>
				<TableColumnDropdown onAddColumn={handleAddColumn} />
			</div>

			<ScrollArea className="flex-1 px-4 min-h-0">
				<DndContext
					sensors={sensors}
					collisionDetection={closestCenter}
					onDragStart={handleDragStart}
					onDragOver={handleDragOver}
					onDragEnd={handleDragEnd}
					onDragCancel={handleDragCancel}
				>
					<SortableContext
						items={optimisticColumns.map((c) => c.id)}
						strategy={verticalListSortingStrategy}
					>
						{optimisticColumns.map((column) => (
							<SortableItem
								key={column.id}
								column={column}
								openAccordions={openAccordions}
								setOpenAccordions={setOpenAccordions}
								deleteColumn={handleDeleteColumn}
								updateColumn={handleUpdateColumn}
							/>
						))}
					</SortableContext>
				</DndContext>

				{columns.length === 0 && (
					<div className="text-center py-4 text-sm text-muted-foreground border-2 border-dashed rounded-md">
						No columns added yet. Click "Add Column" to get started.
					</div>
				)}
			</ScrollArea>
		</div>
	);
}

function SortableItem({
	column,
	openAccordions,
	setOpenAccordions,
	deleteColumn,
	updateColumn,
}: {
	column: ColumnConfig;
	openAccordions: Map<string, boolean>;
	setOpenAccordions: React.Dispatch<React.SetStateAction<Map<string, boolean>>>;
	deleteColumn: (columnId: string) => void;
	updateColumn: (columnId: string, values: Partial<ColumnConfig>) => void;
}) {
	const { attributes, listeners, setNodeRef, transform, transition } =
		useSortable({ id: column.id });

	const style = {
		transform: transform
			? `translate3d(${transform.x}px, ${transform.y}px, 0)`
			: undefined,
		transition,
	};

	const isOpen = openAccordions.get(column.id) || false;

	const form = useAppForm({
		defaultValues: column,
		listeners: {
			onChangeDebounceMs: 500,
			onChange: ({ formApi }) => {
				updateColumn(column.id, formApi.baseStore.state.values);
			},
		},
	});

	return (
		<div
			ref={setNodeRef}
			style={style}
			{...attributes}
			className="w-full rounded-xl border border-dashed py-1.5 my-2 bg-background"
		>
			<div className="w-full group">
				<div className="flex items-center justify-between px-2">
					<div
						className="flex items-center justify-start gap-2 size-full"
						{...listeners}
					>
						<LucideGripVertical
							size={20}
							className="dark:text-muted-foreground text-muted-foreground"
						/>
						<div className="flex justify-between w-full items-center  truncate max-w-xs md:max-w-sm">
							<span>{form.baseStore.state.values.label}</span>
							<Badge variant="outline" className="">
								{form.baseStore.state.values.type}
							</Badge>
						</div>
					</div>
					<div className="flex items-center justify-end lg:opacity-0 opacity-100 group-hover:opacity-100 duration-100">
						<Button
							type="button"
							variant="ghost"
							size="icon"
							onClick={() => deleteColumn(column.id)}
							className="rounded-xl h-9"
						>
							<DeleteIcon />
						</Button>
					</div>
				</div>
				<Accordion
					type="single"
					collapsible
					value={isOpen ? `item-${column.id}` : undefined}
					onValueChange={(value) =>
						setOpenAccordions((prev) =>
							new Map(prev).set(column.id, value === `item-${column.id}`),
						)
					}
					className="w-full"
				>
					<AccordionItem value={`item-${column.id}`} className="border-none">
						<AccordionTrigger className="px-2 py-2  text-sm text-muted-foreground hover:no-underline">
							Customize Column
						</AccordionTrigger>
						<AccordionContent className="px-2 pb-4 space-y-4">
							<form.AppForm>
								<form onSubmit={(e) => e.preventDefault()}>
									<div className="flex gap-2">
										<div className="flex-1">
											<Label className="text-xs text-muted-foreground">
												Column Name
											</Label>
											<form.Field name="label">
												{(field) => (
													<Input
														value={field.state.value}
														onChange={(e) =>
															form.setFieldValue("label", e.target.value)
														}
														placeholder="Column name"
														className="h-8 text-sm"
													/>
												)}
											</form.Field>
										</div>
									</div>
									{/* <div className="flex gap-2">
										<div className="flex-1">
											<Label className="text-xs text-muted-foreground">
												Accessor
											</Label>
											<form.Field name="accessor">
												{(field) => (
													<Input
														value={field.state.value}
														onChange={(e) =>
															form.setFieldValue("accessor", e.target.value)
														}
														placeholder="Accessor key"
														className="h-8 text-sm"
													/>
												)}
											</form.Field>
										</div>
										<div className="flex-1">
											<Label className="text-xs text-muted-foreground">
												Type
											</Label>
											<form.Field name="type">
												{(field) => (
													<Select
														value={field.state.value}
														onValueChange={(value) => {
															form.setFieldValue(
																"type",
																value as TableBuilder["table"]["columns"][0]["type"],
															);
															// Also update filterable if type changes to string or enum
															if (value === "string" || value === "enum") {
																form.setFieldValue("filterable", true);
															}
														}}
													>
														<SelectTrigger className="h-8 text-sm">
															<SelectValue placeholder="Select type" />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="string">String</SelectItem>
															<SelectItem value="number">Number</SelectItem>
															<SelectItem value="boolean">Boolean</SelectItem>
															<SelectItem value="date">Date</SelectItem>
															<SelectItem value="object">Object</SelectItem>
															<SelectItem value="enum">Enum</SelectItem>
															<SelectItem value="array">Array</SelectItem>
														</SelectContent>
													</Select>
												)}
											</form.Field>
										</div>
									</div> */}
									<div className="flex items-center mt-2 gap-2">
										<form.Field name="filterable">
											{(field) => (
												<Checkbox
													id={`filterable-${column.id}`}
													checked={field.state.value || false}
													onCheckedChange={(e) =>
														form.setFieldValue("filterable", e as boolean)
													}
													className="h-4 w-4"
												/>
											)}
										</form.Field>
										<Label
											htmlFor={`filterable-${column.id}`}
											className="text-xs text-muted-foreground"
										>
											Enable Filtering
										</Label>
									</div>
								</form>
							</form.AppForm>
						</AccordionContent>
					</AccordionItem>
				</Accordion>
			</div>
		</div>
	);
}
