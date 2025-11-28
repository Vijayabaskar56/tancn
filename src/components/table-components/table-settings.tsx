import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { useAppForm } from "@/components/ui/tanstack-form";
import useTableStore from "@/hooks/use-table-store";
import { TableBuilderService } from "@/services/table-builder.service";
import {
	ArrowRightLeftIcon,
	CheckSquare,
	Eye,
	GripVertical,
	Link,
	MoreHorizontal,
	MoveHorizontal,
	Pin,
	Search,
	SortAsc,
} from "lucide-react";
import { useId } from "react";
import * as v from "valibot";
import { Separator } from "../ui/separator";
import { logger } from "@/utils/utils";

const TableSettingsSchema = v.object({
	isGlobalSearch: v.optional(v.boolean(), false),
	enableHiding: v.optional(v.boolean(), false),
	enableSorting: v.optional(v.boolean(), false),
	enableResizing: v.optional(v.boolean(), false),
	enablePinning: v.optional(v.boolean(), false),
	enableRowSelection: v.optional(v.boolean(), false),
	enableCRUD: v.optional(v.boolean(), false),
	enableColumnDragging: v.optional(v.boolean(), false),
	enableRowDragging: v.optional(v.boolean(), false),
	enableColumnMovable : v.optional(v.boolean(), false),
	enableUrlFiltering: v.optional(v.boolean(), false),
});

export function TableSettingsSidebar() {
	const focusOnErrorId = useId();
	const validationMethodId = useId();
	const asyncValidationId = useId();
	const preferredSchemaId = useId();
	const preferredFrameworkId = useId();
	const rowSelectionId = useId();
	const rowActionsId = useId();
	const draggableId = useId();
	const urlFilteringId = useId();
	const data = useTableStore();

	const form = useAppForm({
		defaultValues: {
			isGlobalSearch: data?.settings?.isGlobalSearch ?? false,
			enableHiding: data?.settings?.enableHiding ?? false,
			enableSorting: data?.settings?.enableSorting ?? false,
			enableResizing: data?.settings?.enableResizing ?? false,
			enablePinning: data?.settings?.enablePinning ?? false,
			enableRowSelection: data?.settings?.enableRowSelection ?? false,
			enableCRUD: data?.settings?.enableCRUD ?? false,
			enableColumnDragging: data?.settings?.enableColumnDragging ?? false,
			enableRowDragging: data?.settings?.enableRowDragging ?? false,
			enableColumnMovable : data?.settings?.enableColumnMovable ?? false,
			enableUrlFiltering: data?.settings?.enableUrlFiltering ?? false,
		} as v.InferInput<typeof TableSettingsSchema>,
		validators: {
			onChange: TableSettingsSchema,
		},
		listeners: {
			onChangeDebounceMs: 1000,
			onChange: ({ formApi }) => {
				logger('test',formApi.baseStore.state.values ,);
				TableBuilderService.updateSettings(formApi.baseStore.state.values);
			},
		},
	});

	return (
		<div className="flex flex-col h-full md:h-full max-h-[35vh] md:max-h-none">
			<form.AppForm>
				<form
					noValidate
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						void form.handleSubmit();
					}}
				>
					<div className="mb-4 pb-2 px-4 border-b">
						<h3 className="text-lg font-semibold text-primary">
							Table Settings
						</h3>
						<p className="text-sm text-muted-foreground">
							Configure Your Table
						</p>
					</div>

					<ScrollArea className="h-[calc(100vh-20rem)]">
						<div className=" space-y-4 sm:space-y-6">
							<div>
								<div className="space-y-3">
									<form.AppField name="isGlobalSearch" mode="value">
										{(field) => (
											<div className=" border-b mx-2">
												<div className="flex items-center justify-between p-3">
													<div className="flex items-center gap-2">
														<Search className="w-4 h-4 text-muted-foreground" />
														<field.FieldLabel
															htmlFor={focusOnErrorId}
															className="text-sm"
														>
															Global Search
														</field.FieldLabel>
													</div>
													<Switch
														id={focusOnErrorId}
														checked={field.state.value}
														onCheckedChange={field.handleChange}
														className="data-[state=unchecked]:border-input data-[state=unchecked]:[&_span]:bg-input data-[state=unchecked]:bg-transparent [&_span]:transition-all data-[state=unchecked]:[&_span]:size-4 data-[state=unchecked]:[&_span]:translate-x-0.5 data-[state=unchecked]:[&_span]:rtl:-translate-x-0.5 data-[state=unchecked]:[&_span]:shadow-none"
													/>
												</div>
												<Separator className="my-2" />
												<field.FieldDescription className="pb-2">
													Enable global search across all table columns. For
													more info check the TanStack Table docs:{" "}
													<a
														className="text-primary"
														href="https://tanstack.com/table/latest/docs/guide/global-filtering"
														target="_blank"
													>
														Global Filtering
													</a>
												</field.FieldDescription>
											</div>
										)}
									</form.AppField>
									<form.AppField name="enableColumnMovable" mode="value">
										{(field) => (
											<div className=" border-b mx-2">
												<div className="flex items-center justify-between p-3">
													<div className="flex items-center gap-2">
														<ArrowRightLeftIcon className="w-4 h-4 text-muted-foreground" />
														<field.FieldLabel
															htmlFor={focusOnErrorId}
															className="text-sm"
														>
															Column Movable
														</field.FieldLabel>
													</div>
													<Switch
														id={focusOnErrorId}
														checked={field.state.value}
														onCheckedChange={field.handleChange}
														className="data-[state=unchecked]:border-input data-[state=unchecked]:[&_span]:bg-input data-[state=unchecked]:bg-transparent [&_span]:transition-all data-[state=unchecked]:[&_span]:size-4 data-[state=unchecked]:[&_span]:translate-x-0.5 data-[state=unchecked]:[&_span]:rtl:-translate-x-0.5 data-[state=unchecked]:[&_span]:shadow-none"
													/>
												</div>
												<Separator className="my-2" />
												<field.FieldDescription className="pb-2">
													Allow moving columns to adjacent positions via the header menu. For more info check the TanStack Table docs:{" "}
													<a
														className="text-primary"
														href="https://tanstack.com/table/latest/docs/guide/column-ordering"
														target="_blank"

													>
														Column Ordering
													</a>
												</field.FieldDescription>
											</div>
										)}
									</form.AppField>
									{/* <form.AppField name="enableUrlFiltering" mode="value">
										{(field) => (
											<div className=" border-b mx-2">
												<div className="flex items-center justify-between p-3">
													<div className="flex items-center gap-2">
														<Link className="w-4 h-4 text-muted-foreground" />
														<field.FieldLabel
															htmlFor={urlFilteringId}
															className="text-sm"
														>
															URL Filtering
														</field.FieldLabel>
													</div>
													<Switch
														id={urlFilteringId}
														checked={field.state.value}
														onCheckedChange={field.handleChange}
														className="data-[state=unchecked]:border-input data-[state=unchecked]:[&_span]:bg-input data-[state=unchecked]:bg-transparent [&_span]:transition-all data-[state=unchecked]:[&_span]:size-4 data-[state=unchecked]:[&_span]:translate-x-0.5 data-[state=unchecked]:[&_span]:rtl:-translate-x-0.5 data-[state=unchecked]:[&_span]:shadow-none"
													/>
												</div>
												<Separator className="my-2" />
												<field.FieldDescription className="pb-2">
													Enable filtering table data based on URL parameters. For more info check the TanStack Table docs:{" "}
													<a
														className="text-primary"
														href="https://tanstack.com/table/latest/docs/guide/global-filtering"
														target="_blank"

													>
														Global Filtering
													</a>
												</field.FieldDescription>
											</div>
										)}
									</form.AppField> */}
									<form.AppField name="enableSorting" mode="value">
										{(field) => (
											<div className="p-3 border-b mx-2">
												<div className="flex items-center justify-between">
													<div className="flex items-center gap-2">
														<SortAsc className="w-4 h-4 text-muted-foreground" />
														<field.FieldLabel
															htmlFor={validationMethodId}
															className="text-sm"
														>
															Column Sorting
														</field.FieldLabel>
													</div>
													<Switch
														id={validationMethodId}
														checked={field.state.value}
														onCheckedChange={field.handleChange}
														className="data-[state=unchecked]:border-input data-[state=unchecked]:[&_span]:bg-input data-[state=unchecked]:bg-transparent [&_span]:transition-all data-[state=unchecked]:[&_span]:size-4 data-[state=unchecked]:[&_span]:translate-x-0.5 data-[state=unchecked]:[&_span]:rtl:-translate-x-0.5 data-[state=unchecked]:[&_span]:shadow-none"
													/>
												</div>
												<Separator className="my-2" />
												<field.FieldDescription>
													Allow sorting on table columns. For more info check
													the TanStack Table docs:{" "}
													<a
														className="text-primary"
														href="https://tanstack.com/table/latest/docs/guide/sorting"
														target="_blank"

													>
														Sorting
													</a>
												</field.FieldDescription>
												<field.FieldError />
											</div>
										)}
									</form.AppField>

									<form.AppField name="enableResizing" mode="value">
										{(field) => (
											<div className="p-3 border-b mx-2">
												<div className="flex items-center justify-between">
													<div className="flex items-center gap-2">
															<MoveHorizontal className="w-4 h-4 text-muted-foreground" />
														<field.FieldLabel
															htmlFor={asyncValidationId}
															className="text-sm"
														>
															Column Resizing
														</field.FieldLabel>
													</div>
													<Switch
														id={asyncValidationId}
														checked={field.state.value}
														onCheckedChange={field.handleChange}
														className="data-[state=unchecked]:border-input data-[state=unchecked]:[&_span]:bg-input data-[state=unchecked]:bg-transparent [&_span]:transition-all data-[state=unchecked]:[&_span]:size-4 data-[state=unchecked]:[&_span]:translate-x-0.5 data-[state=unchecked]:[&_span]:rtl:-translate-x-0.5 data-[state=unchecked]:[&_span]:shadow-none"
													/>
												</div>
												<Separator className="my-2" />
												<field.FieldDescription>
													Allow resizing of table columns. For more info check
													the TanStack Table docs:{" "}
													<a
														className="text-primary"
														href="https://tanstack.com/table/latest/docs/guide/column-sizing"
														target="_blank"

													>
														Column Sizing
													</a>
												</field.FieldDescription>
											</div>
										)}
									</form.AppField>

									<form.AppField name="enablePinning" mode="value">
										{(field) => (
											<div className="p-3 border-b mx-2">
												<div className="flex items-center justify-between">
													<div className="flex items-center gap-2">
														<Pin className="w-4 h-4 text-muted-foreground" />
														<field.FieldLabel
															htmlFor={preferredSchemaId}
															className="text-sm"
														>
															Column Pinning
														</field.FieldLabel>
													</div>
													<Switch
														id={preferredSchemaId}
														checked={field.state.value}
														onCheckedChange={field.handleChange}
														className="data-[state=unchecked]:border-input data-[state=unchecked]:[&_span]:bg-input data-[state=unchecked]:bg-transparent [&_span]:transition-all data-[state=unchecked]:[&_span]:size-4 data-[state=unchecked]:[&_span]:translate-x-0.5 data-[state=unchecked]:[&_span]:rtl:-translate-x-0.5 data-[state=unchecked]:[&_span]:shadow-none"
													/>
												</div>
												<Separator className="my-2" />
												<field.FieldDescription>
													Allow pinning columns to left or right. For more info
													check the TanStack Table docs:{" "}
													<a
														className="text-primary"
														href="https://tanstack.com/table/latest/docs/guide/column-pinning"
														target="_blank"

													>
														Column Pinning
													</a>
												</field.FieldDescription>
												<field.FieldError />
											</div>
										)}
									</form.AppField>

									<form.AppField name="enableHiding" mode="value">
										{(field) => (
											<div className="p-3 border-b mx-2">
												<div className="flex items-center justify-between">
													<div className="flex items-center gap-2">
														<Eye className="w-4 h-4 text-muted-foreground" />
														<field.FieldLabel
															htmlFor={preferredFrameworkId}
															className="text-sm"
														>
															Column Visibility
														</field.FieldLabel>
													</div>
													<Switch
														id={preferredFrameworkId}
														checked={field.state.value}
														onCheckedChange={field.handleChange}
														className="data-[state=unchecked]:border-input data-[state=unchecked]:[&_span]:bg-input data-[state=unchecked]:bg-transparent [&_span]:transition-all data-[state=unchecked]:[&_span]:size-4 data-[state=unchecked]:[&_span]:translate-x-0.5 data-[state=unchecked]:[&_span]:rtl:-translate-x-0.5 data-[state=unchecked]:[&_span]:shadow-none"
													/>
												</div>
												<Separator className="my-2" />
												<field.FieldDescription>
													Allow hiding/showing table columns. For more info
													check the TanStack Table docs:{" "}
													<a
														className="text-primary"
														href="https://tanstack.com/table/latest/docs/guide/column-visibility"
														target="_blank"

													>
														Column Visibility
													</a>
												</field.FieldDescription>
												<field.FieldError />
											</div>
										)}
									</form.AppField>
									<form.AppField name="enableColumnDragging" mode="value">
										{(field) => (
											<div className="p-3 border-b mx-2">
												<div className="flex items-center justify-between">
													<div className="flex items-center gap-2">
														<GripVertical className="w-4 h-4 text-muted-foreground" />
														<field.FieldLabel
															htmlFor={draggableId}
															className="text-sm"
														>
															Column Dragging
														</field.FieldLabel>
													</div>
													<Switch
														id={draggableId}
														checked={field.state.value}
														onCheckedChange={field.handleChange}
														className="data-[state=unchecked]:border-input data-[state=unchecked]:[&_span]:bg-input data-[state=unchecked]:bg-transparent [&_span]:transition-all data-[state=unchecked]:[&_span]:size-4 data-[state=unchecked]:[&_span]:translate-x-0.5 data-[state=unchecked]:[&_span]:rtl:-translate-x-0.5 data-[state=unchecked]:[&_span]:shadow-none"
													/>
												</div>
												<Separator className="my-2" />
												<field.FieldDescription>
													Allow dragging to reorder table columns. For more info
													check the TanStack Table docs:{" "}
													<a
														className="text-primary"
														href="https://tanstack.com/table/latest/docs/guide/column-ordering"
														target="_blank"

													>
														Column Ordering
													</a>
												</field.FieldDescription>
												<field.FieldError />
											</div>
										)}
									</form.AppField>
									<form.AppField name="enableRowSelection" mode="value">
										{(field) => (
											<div className="p-3 border-b mx-2">
												<div className="flex items-center justify-between">
													<div className="flex items-center gap-2">
														<CheckSquare className="w-4 h-4 text-muted-foreground" />
														<field.FieldLabel
															htmlFor={rowSelectionId}
															className="text-sm"
														>
															Row Selection
														</field.FieldLabel>
													</div>
													<Switch
														id={rowSelectionId}
														checked={field.state.value}
														onCheckedChange={field.handleChange}
														className="data-[state=unchecked]:border-input data-[state=unchecked]:[&_span]:bg-input data-[state=unchecked]:bg-transparent [&_span]:transition-all data-[state=unchecked]:[&_span]:size-4 data-[state=unchecked]:[&_span]:translate-x-0.5 data-[state=unchecked]:[&_span]:rtl:-translate-x-0.5 data-[state=unchecked]:[&_span]:shadow-none"
													/>
												</div>
												<Separator className="my-2" />
												<field.FieldDescription>
													Enable row selection with checkboxes. For more info
													check the TanStack Table docs:{" "}
													<a
														className="text-primary"
														href="https://tanstack.com/table/latest/docs/guide/row-selection"
														target="_blank"

													>
														Row Selection
													</a>
												</field.FieldDescription>
												<field.FieldError />
											</div>
										)}
									</form.AppField>

									<form.AppField name="enableCRUD" mode="value">
										{(field) => (
											<div className="p-3 border-b mx-2">
												<div className="flex items-center justify-between">
													<div className="flex items-center gap-2">
														<MoreHorizontal className="w-4 h-4 text-muted-foreground" />
														<field.FieldLabel
															htmlFor={rowActionsId}
															className="text-sm"
														>
															Row Actions
														</field.FieldLabel>
													</div>
													<Switch
														id={rowActionsId}
														checked={field.state.value}
														onCheckedChange={field.handleChange}
														className="data-[state=unchecked]:border-input data-[state=unchecked]:[&_span]:bg-input data-[state=unchecked]:bg-transparent [&_span]:transition-all data-[state=unchecked]:[&_span]:size-4 data-[state=unchecked]:[&_span]:translate-x-0.5 data-[state=unchecked]:[&_span]:rtl:-translate-x-0.5 data-[state=unchecked]:[&_span]:shadow-none"
													/>
												</div>
												<Separator className="my-2" />
												<field.FieldDescription>
													Show action buttons for each row (edit, delete, etc.).
													For more info check the TanStack Table docs:{" "}
													<a
														className="text-primary"
														href="https://tanstack.com/table/latest/docs/guide/actions"
														target="_blank"

													>
														Table Actions
													</a>
												</field.FieldDescription>
												<field.FieldError />
											</div>
										)}
									</form.AppField>


{/*
									<form.AppField name="enableRowDragging" mode="value">
										{(field) => (
											<div className="p-3 border-b mx-2">
												<div className="flex items-center justify-between">
													<div className="flex items-center gap-2">
														<MoveVertical className="w-4 h-4 text-muted-foreground" />
														<field.FieldLabel
															htmlFor={rowDraggableId}
															className="text-sm"
														>
															Row Dragging
														</field.FieldLabel>
													</div>
													<Switch
														id={rowDraggableId}
														checked={field.state.value}
														onCheckedChange={field.handleChange}
														className="data-[state=unchecked]:border-input data-[state=unchecked]:[&_span]:bg-input data-[state=unchecked]:bg-transparent [&_span]:transition-all data-[state=unchecked]:[&_span]:size-4 data-[state=unchecked]:[&_span]:translate-x-0.5 data-[state=unchecked]:[&_span]:rtl:-translate-x-0.5 data-[state=unchecked]:[&_span]:shadow-none data-[state=unchecked]:[&_span]:rtl:translate-x-0.5"
													/>
												</div>
												<Separator className="my-2" />
												<field.FieldDescription>
													Allow dragging to reorder table rows. For more info
													check the TanStack Table docs:{" "}
													<a
														className="text-primary"
														href="https://tanstack.com/table/latest/docs/guide/row-dragging"
														target="_blank"

													>
														Row Dragging
													</a>
												</field.FieldDescription>
												<field.FieldError />
											</div>
										)}
									</form.AppField> */}
								</div>
							</div>
						</div>
					</ScrollArea>
				</form>
			</form.AppForm>
		</div>
	);
}
