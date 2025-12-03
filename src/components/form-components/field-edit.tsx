import {
	Check,
	CircleX,
	Delete,
	Edit,
	LucideGripVertical,
	PlusCircle,
} from "lucide-react";
import { Reorder } from "motion/react";
import * as React from "react";
import { RenderFormElement } from "@/components/form-components/render-form-element";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppForm } from "@/components/ui/tanstack-form";
import type { AppForm } from "@/hooks/use-form-builder";
import { useFormStore } from "@/hooks/use-form-store";
import { useListState } from "@/hooks/use-list-state";
import { useIsMobile } from "@/hooks/use-mobile";
import type { FormElement, Option } from "@/types/form-types";
import { isStatic } from "@/utils/utils";

const inputTypes = [
	{
		value: "text",
		label: "Text",
	},
	{
		value: "number",
		label: "Number",
	},
	{ value: "url", label: "URL" },
	{
		value: "password",
		label: "Password",
	},
	{
		value: "email",
		label: "Email",
	},
	{
		value: "tel",
		label: "Phone number",
	},
];

function OptionsList({
	options = [],
	onChange,
}: {
	options: Option[];
	onChange: (options: Option[]) => void;
}) {
	const [localOptions, handlers] = useListState<Option>(options);
	const [editingIndex, setEditingIndex] = React.useState<number | null>(null);

	const [editingOption, setEditingOption] = React.useState<Option>({
		value: "",
		label: "",
	});

	const addOption = () => {
		const newOption: Option = {
			value: `option_${Date.now()}`,
			label: `Option ${options.length + 1}`,
		};
		handlers.append(newOption);
		onChange([...localOptions, newOption]);
	};

	const deleteOption = (index: number) => {
		handlers.remove(index);
		const updatedOptions = localOptions.filter((_, i) => i !== index);
		onChange(updatedOptions);
	};

	const startEdit = (index: number) => {
		setEditingIndex(index);
		setEditingOption({ ...localOptions[index] });
	};

	const saveEdit = () => {
		if (editingIndex !== null) {
			handlers.setItem(editingIndex, editingOption);
			const updatedOptions = localOptions.map((option, index) =>
				index === editingIndex ? editingOption : option,
			);
			onChange(updatedOptions);
			setEditingIndex(null);
		}
	};

	const cancelEdit = () => {
		setEditingIndex(null);
		setEditingOption({ value: "", label: "" });
	};
	const handleReorder = (newOrder: Option[]) => {
		onChange(newOrder);
		handlers.setState(newOrder);
	};
	return (
		<div className="space-y-3 w-full">
			<div className="flex items-center justify-between">
				<Label className="text-sm font-medium">Options</Label>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={addOption}
					className="h-8 px-2"
				>
					<PlusCircle className="h-4 w-4 mr-1" />
					Add Option
				</Button>
			</div>

			<div className="space-y-2 max-h-48 overflow-y-auto">
				<Reorder.Group
					axis="y"
					onReorder={handleReorder}
					values={localOptions}
					className="space-y-2"
					layoutScroll
				>
					{localOptions.map((option, index) => (
						<Reorder.Item
							key={option.value}
							value={option}
							className="flex items-center gap-2 py-2 pr-2 pl-4 border rounded-md cursor-grab active:cursor-grabbing group bg-secondary"
						>
							<LucideGripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
							{editingIndex === index ? (
								<>
									<div className="flex-1 space-y-2">
										<div className="flex gap-2">
											<div className="flex-1">
												<Label className="text-xs text-muted-foreground">
													Label
												</Label>
												<Input
													value={editingOption.label as string}
													onChange={(e) => {
														const newLabel = e.target.value;
														const newValue = newLabel.toLowerCase();
														// .replace(/[^a-z0-9]/g, "_")
														// .replace(/_+/g, "_")
														// .replace(/^_|_$/g, "");
														setEditingOption({
															...editingOption,
															label: newLabel,
															value: newValue,
														});
													}}
													placeholder="Option label"
													className="h-8 text-sm"
												/>
											</div>
											<div className="flex-1">
												<Label className="text-xs text-muted-foreground">
													Value
												</Label>
												<Input
													value={editingOption.value}
													onChange={(e) =>
														setEditingOption({
															...editingOption,
															value: e.target.value,
														})
													}
													placeholder="Option value"
													className="h-8 text-sm"
												/>
											</div>
										</div>
									</div>
									<div className="flex gap-1">
										<Button
											type="button"
											variant="ghost"
											size="icon"
											onClick={saveEdit}
											className="size-8"
										>
											<Check className="size-4" />
										</Button>
										<Button
											type="button"
											variant="ghost"
											size="icon"
											onClick={cancelEdit}
											className="size-8"
										>
											<CircleX className="size-4" />
										</Button>
									</div>
								</>
							) : (
								<>
									<div className="flex-1 min-w-0">
										<div className="text-sm font-medium truncate">
											{option.label}
										</div>
										<div className="text-xs text-muted-foreground truncate">
											Value: {option.value}
										</div>
									</div>
									<div className="flex gap-1 opacity-0 group-hover:opacity-100 duration-200">
										<Button
											type="button"
											variant="ghost"
											size="icon"
											onClick={() => startEdit(index)}
											className="size-8"
										>
											<Edit className="size-4" />
										</Button>
										<Button
											type="button"
											variant="ghost"
											size="icon"
											onClick={() => deleteOption(index)}
											className="size-8"
										>
											<Delete className="size-4" />
										</Button>
									</div>
								</>
							)}
						</Reorder.Item>
					))}
				</Reorder.Group>

				{options.length === 0 && (
					<div className="text-center py-4 text-sm text-muted-foreground border-2 border-dashed rounded-md">
						No options added yet. Click "Add Option" to get started.
					</div>
				)}
			</div>
		</div>
	);
}

function FormElementAttributes({
	fieldIndex,
	close,
	j,
	stepIndex,
	...formElement
}: FormElement & {
	fieldIndex: number;
	stepIndex?: number;
	j?: number;
	close: () => void;
}) {
	const form = useAppForm({
		defaultValues: formElement as FormElement,
		onSubmit: ({ value }) => {
			actions.editElement({
				fieldIndex: fieldIndex,
				modifiedFormElement: value,
				j,
				stepIndex,
			});
			close();
		},
	});
	const { actions } = useFormStore();
	const { fieldType } = formElement;
	const isFieldWithOptions =
		fieldType === "Select" ||
		fieldType === "MultiSelect" ||
		fieldType === "RadioGroup" ||
		fieldType === "ToggleGroup";
	return (
		<form.AppForm>
			<form
				onSubmit={() => form.handleSubmit()}
				className="pt-4 border-t border-dashed dark:border-foreground/30"
			>
				{/* {JSON.stringify(form.watch(), null, 2)} */}
				{/* {JSON.stringify(formElement, null, 2)} */}
				<div>
					{isStatic(fieldType) ? (
						<div className="mb-4">
							<RenderFormElement
								formElement={{
									id: formElement.id,
									name: "content",
									label: `Customize ${fieldType}`,
									fieldType: "Input",
									defaultValue: formElement.content,
									required: true,
									className: "border-secondary",
								}}
								form={form as AppForm}
							/>
						</div>
					) : (
						<div className="flex flex-col items-center justify-start w-full gap-3 mb-2">
							<RenderFormElement
								formElement={{
									id: formElement.id,
									name: "label",
									label: "Label attribute",
									fieldType: "Input",
									type: "text",
									required: true,
								}}
								form={form as AppForm}
							/>
							<div className="flex items-center justify-between gap-4 w-full">
								<RenderFormElement
									formElement={{
										id: formElement.id,
										name: "name",
										label: "Name attribute",
										fieldType: "Input",
										defaultValue: formElement.name,
										required: true,
										className: "outline-secondary",
									}}
									form={form as AppForm}
								/>
								<RenderFormElement
									formElement={{
										id: formElement.id,
										name: "placeholder",
										label: "Placeholder attribute",
										fieldType: "Input",
										type: "text",
										required: true,
									}}
									form={form as AppForm}
								/>
							</div>
							<RenderFormElement
								formElement={{
									id: formElement.id,
									name: "description",
									label: "Description attribute",
									fieldType: "Input",
									placeholder: "Add a description",
								}}
								form={form as AppForm}
							/>
							{fieldType === "Input" && (
								<RenderFormElement
									formElement={{
										id: formElement.id,
										name: "type",
										label: "Type attribute",
										fieldType: "ToggleGroup",
										type: "single",
										options: inputTypes,
										required: true,
										value: formElement.type,
									}}
									form={form as AppForm}
								/>
							)}
							{fieldType === "Slider" && (
								<div className="flex items-center justify-between gap-4">
									<RenderFormElement
										formElement={{
											id: formElement.id,
											name: "min",
											label: "Min value",
											fieldType: "Input",
											type: "number",
											defaultValue: formElement.min,
											required: true,
										}}
										form={form as AppForm}
									/>
									<RenderFormElement
										formElement={{
											id: formElement.id,
											name: "max",
											label: "Max value",
											fieldType: "Input",
											type: "number",
											defaultValue: formElement.max,
											required: true,
										}}
										form={form as AppForm}
									/>
									<RenderFormElement
										formElement={{
											id: formElement.id,
											name: "step",
											label: "Step value",
											fieldType: "Input",
											type: "number",
											defaultValue: formElement.step,
											required: true,
										}}
										form={form as AppForm}
									/>
								</div>
							)}
							{fieldType === "ToggleGroup" && (
								<RenderFormElement
									formElement={{
										id: formElement.id,
										name: "type",
										label: "Choose single or multiple choices",
										fieldType: "ToggleGroup",
										options: [
											{ value: "single", label: "Single" },
											{ value: "multiple", label: "Multiple" },
										],
										defaultValue: formElement.type,
										required: true,
										type: "single",
									}}
									form={form as AppForm}
								/>
							)}
							{isFieldWithOptions && (
								<OptionsList
									options={formElement.options || []}
									onChange={(options) => form.setFieldValue("options", options)}
								/>
							)}
							<div className="flex items-center w-full gap-4 justify-start">
								<div>
									<RenderFormElement
										formElement={{
											id: formElement.id,
											name: "required",
											label: "Required",
											fieldType: "Checkbox",
										}}
										form={form as AppForm}
									/>
								</div>
								<RenderFormElement
									formElement={{
										id: formElement.id,
										name: "disabled",
										label: "Disabled",
										fieldType: "Checkbox",
									}}
									form={form as AppForm}
								/>
							</div>
						</div>
					)}
				</div>
				<div className="flex items-center justify-end gap-3 w-full">
					<Button size="sm" variant="ghost" onClick={close} type="button">
						Cancel
					</Button>
					<Button size="sm" type="submit" variant="secondary">
						Save
					</Button>
				</div>
			</form>
		</form.AppForm>
	);
}
const SavedFormElementAttributes = ({
	fieldIndex,
	stepIndex,
	j,
	formElement,
	close,
}: {
	fieldIndex: number;
	stepIndex: number;
	j: number;
	formElement: FormElement;
	close: () => void;
}) => (
	<FormElementAttributes
		fieldIndex={fieldIndex}
		stepIndex={stepIndex}
		j={j}
		{...formElement}
		close={close}
	/>
);
export function FieldCustomizationView({
	fieldIndex,
	formElement,
	j,
	stepIndex,
}: {
	fieldIndex: number;
	j?: number;
	formElement: FormElement;
	stepIndex?: number;
}) {
	const [open, setOpen] = React.useState(false);
	const isMobile = useIsMobile();
	const close = () => setOpen(false);
	const title = "Customize Form Field Attributes";

	if (isMobile) {
		return (
			<Drawer open={open} onOpenChange={setOpen}>
				<DrawerTrigger asChild>
					<Button
						type="button"
						variant="ghost"
						size="icon"
						className="rounded-xl h-9"
					>
						<Edit />
					</Button>
				</DrawerTrigger>
				<DrawerContent className="px-4">
					<DrawerHeader className="px-0">
						<DrawerTitle className="text-start text-lg">{title}</DrawerTitle>
					</DrawerHeader>
					<SavedFormElementAttributes
						fieldIndex={fieldIndex}
						stepIndex={stepIndex}
						j={j}
						formElement={formElement}
						close={close}
					/>
				</DrawerContent>
			</Drawer>
		);
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					className="rounded-xl h-9"
				>
					<Edit />
				</Button>
			</DialogTrigger>
			<DialogContent showCloseButton={false} className="sm:max-w-[530px]">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
				</DialogHeader>
				<SavedFormElementAttributes
					fieldIndex={fieldIndex}
					stepIndex={stepIndex}
					j={j}
					formElement={formElement}
					close={close}
				/>
			</DialogContent>
		</Dialog>
	);
}
