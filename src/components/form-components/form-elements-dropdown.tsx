// form-elements-dropdown.tsx

import { Plus, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formElementsList } from "@/constants/form-elements-list";
import { useFormStore } from "@/hooks/use-form-store";
import type { FormArray, FormElement } from "@/types/form-types";
import { logger } from "@/utils/utils";
import { PlusIcon } from "../ui/plus";

type DropdownContext = "nested" | "multistep" | "formarray";

interface BaseDropdownProps {
	context: DropdownContext;
	fieldIndex?: number;
	stepIndex?: number;
	formArrayId?: string;
}

/**
 * Use for adding a nested form element
 */
//======================================
export function FormElementsDropdown({
	fieldIndex,
	stepIndex,
	type = "MS",
	arrayId,
	j,
	isFormArrayField,
}: {
	/**
	 * Field Index where a nested element should be appended to the main array
	 */
	fieldIndex?: number;
	stepIndex?: number;
	arrayId?: string;
	type?: "FA" | "MS";
	j?: number;
	isFormArrayField?: boolean;
}) {
	const { actions } = useFormStore();
	const handleAddingElement = (fieldType: string) => {
		if (type === "MS" || isFormArrayField) {
			actions.appendElement({
				fieldIndex,
				fieldType: fieldType as FormElement["fieldType"],
				stepIndex,
				j: isFormArrayField ? j : undefined,
			});
		} else {
			if (arrayId) {
				actions.addFormArrayField(
					arrayId,
					fieldType as FormElement["fieldType"],
				);
			}
		}
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon" className="rounded-xl h-9">
					<PlusIcon />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent data-align="end" className="p-0">
				<ScrollArea className="h-64">
					<div className="space-y-3 p-3">
						{formElementsList.map((o) => (
							<DropdownMenuItem
								onSelect={() => handleAddingElement(o.fieldType)}
								// actions.appendElement({
								// 	fieldIndex,
								// 	fieldType: o.fieldType as FormElement["fieldType"],
								// 	stepIndex,
								// });
								key={o.name}
								disabled={!!o.static}
								className="px-4"
							>
								{o.name}
							</DropdownMenuItem>
						))}
					</div>
				</ScrollArea>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

/**
 * Unified dropdown for adding form elements in different contexts
 */
export function UnifiedFormElementsDropdown({
	context,
	fieldIndex,
	stepIndex,
	formArrayId,
}: BaseDropdownProps) {
	const { actions, formElements } = useFormStore();

	const handleElementSelect = (fieldType: FormElement["fieldType"]) => {
		switch (context) {
			case "nested":
				if (fieldIndex !== undefined) {
					actions.appendElement({
						fieldIndex,
						fieldType,
						stepIndex,
					});
				}
				break;
			case "multistep":
				actions.appendElement({
					fieldIndex: null,
					fieldType,
					stepIndex,
				});
				break;
			case "formarray":
				if (formArrayId) {
					// Create a new form element based on fieldType
					const baseElement = {
						id: `field_${Date.now()}`,
						name: `field_${Date.now()}`,
						label: `${fieldType} Field`,
						required: false,
					};

					let newElement: FormElement;

					switch (fieldType) {
						case "Input":
							newElement = {
								...baseElement,
								fieldType: "Input" as const,
								type: "text",
							};
							break;
						case "Textarea":
							newElement = {
								...baseElement,
								fieldType: "Textarea" as const,
							};
							break;
						case "Checkbox":
							newElement = {
								...baseElement,
								fieldType: "Checkbox" as const,
							};
							break;
						case "Select":
							newElement = {
								...baseElement,
								fieldType: "Select" as const,
								options: [],
								placeholder: "Select an option",
							};
							break;
						case "RadioGroup":
							newElement = {
								...baseElement,
								fieldType: "RadioGroup" as const,
								options: [],
							};
							break;
						case "Switch":
							newElement = {
								...baseElement,
								fieldType: "Switch" as const,
							};
							break;
						case "Slider":
							newElement = {
								...baseElement,
								fieldType: "Slider" as const,
								min: 0,
								max: 100,
								step: 1,
							};
							break;
						case "DatePicker":
							newElement = {
								...baseElement,
								fieldType: "DatePicker" as const,
							};
							break;
						case "Password":
							newElement = {
								...baseElement,
								fieldType: "Password" as const,
								type: "password",
							};
							break;
						case "OTP":
							newElement = {
								...baseElement,
								fieldType: "OTP" as const,
								maxLength: 6,
							};
							break;
						case "MultiSelect":
							newElement = {
								...baseElement,
								fieldType: "MultiSelect" as const,
								options: [],
								placeholder: "Select options",
							};
							break;
						case "ToggleGroup":
							newElement = {
								...baseElement,
								fieldType: "ToggleGroup" as const,
								options: [],
								type: "single" as const,
							};
							break;
						default:
							newElement = {
								...baseElement,
								fieldType: "Input" as const,
								type: "text",
							};
					}

					// Find the FormArray and update it
					const formArrayElement = (formElements as FormArray[]).find(
						(el: FormArray) => el.id === formArrayId,
					);

					if (
						formArrayElement?.arrayField &&
						Array.isArray(formArrayElement.arrayField)
					) {
						const updatedArrayField = [
							...formArrayElement.arrayField,
							newElement,
						];
						logger("updatedArrayField", updatedArrayField);
						actions.updateFormArray(formArrayId, updatedArrayField);
					}
				}
				break;
		}
	};

	const getTriggerButton = () => {
		switch (context) {
			case "formarray":
				return (
					<Button variant="ghost" size="sm" className="h-8 w-8 p-0">
						<PlusCircle className="h-4 w-4" />
					</Button>
				);
			case "multistep":
				return (
					<Button variant="outline">
						<div className="flex items-center justify-center gap-2">
							<PlusCircle />
							Add Element
						</div>
					</Button>
				);
			default:
				return (
					<Button variant="ghost" size="icon" className="rounded-xl h-9">
						<Plus />
					</Button>
				);
		}
	};

	return (
		<DropdownMenu modal={context === "multistep" ? false : undefined}>
			<DropdownMenuTrigger asChild>{getTriggerButton()}</DropdownMenuTrigger>
			<DropdownMenuContent data-align="end" className="p-0">
				<ScrollArea className="h-64">
					<div className="space-y-3 p-3">
						{formElementsList.map((o) => (
							<DropdownMenuItem
								onSelect={(e) => {
									if (context === "multistep") {
										e.preventDefault(); // Prevent the menu from closing for multistep
									}
									handleElementSelect(o.fieldType as FormElement["fieldType"]);
								}}
								key={o.name}
								disabled={!!o.static}
								className="px-4"
							>
								{o.name}
							</DropdownMenuItem>
						))}
					</div>
				</ScrollArea>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

/**
 * Use for adding a form element to the form when MSF is enabled
 */
//======================================
export function FormElementsStepDropdown({
	stepIndex,
}: {
	stepIndex?: number;
}) {
	const { actions } = useFormStore();
	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger asChild>
				<Button variant="outline">
					<div className="flex items-center justify-center gap-2">
						<PlusCircle />
						Add Element
					</div>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				data-align="end" // not working
				className="p-0"
			>
				<ScrollArea className="h-64">
					<div className="space-y-3 p-3">
						{formElementsList.map((o) => (
							<DropdownMenuItem
								onSelect={(e) => {
									e.preventDefault(); // Prevent the menu from closing
									actions.appendElement({
										fieldIndex: null,
										fieldType: o.fieldType as FormElement["fieldType"],
										stepIndex,
									});
								}}
								key={o.name}
								className="px-4"
							>
								{o.name}
							</DropdownMenuItem>
						))}
					</div>
				</ScrollArea>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
