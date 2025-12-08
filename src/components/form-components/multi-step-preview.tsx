// multi-step-form-preview.tsx

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { FormArrayPreview } from "@/components/form-components/form-array-preview";
import { RenderFormElement } from "@/components/form-components/render-form-element";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useFormBuilder } from "@/hooks/use-form-builder";
import useFormBuilderState from "@/hooks/use-form-builder-state";
import { useMultiStepForm } from "@/hooks/use-multi-step-form";
import useSettings from "@/hooks/use-settings";
import type { FormArray, FormElement, FormStep } from "@/db-collections/form-builder.collections";

function collectFieldNames(items: any[]): string[] {
	const names: string[] = [];
	for (const item of items) {
		if (Array.isArray(item)) {
			names.push(...collectFieldNames(item));
		} else if (typeof item === "object" && item.fieldType === "FormArray") {
			const arrayName = item.name;
			for (let i = 0; i < item.entries.length; i++) {
				names.push(
					...collectFieldNames(item.entries[i].fields).map(
						(name) => `${arrayName}.${i}.${name}`,
					),
				);
			}
		} else if (
			typeof item === "object" &&
			"fieldType" in item &&
			!item.static
		) {
			names.push(item.name);
		}
	}
	return names;
}
export function MultiStepFormPreview() {
	const { formElements  ,} = useFormBuilderState();
	const { form, isDefault } = useFormBuilder();
	const settings = useSettings();
	const validate =
		settings.validationMethod === "onBlur"
			? "blur"
			: settings.validationMethod === "onChange"
				? "change"
				: "submit";
	const { currentStep, isLastStep, goToNext, goToPrevious } = useMultiStepForm({
		initialSteps: formElements as FormStep[],
		onStepValidation: async (step) => {
			const fieldNames = collectFieldNames(
				Array.isArray(step.stepFields)
					? step.stepFields.flat()
					: step.stepFields,
			);
			for (const fieldName of fieldNames) {
				await form.validateField(fieldName, validate);
			}
			const fieldErrors = form.getAllErrors().fields;
			const isValid = fieldNames.every((name) => !fieldErrors[name]);
			return isValid;
		},
	});
	const steps = formElements as FormStep[];
	const current = formElements[currentStep - 1] as FormStep;
	const { isSubmitting, isSubmitted } = form.baseStore.state;
	return (
		<div className="flex flex-col gap-2 pt-3">
			<div className="flex flex-col items-start justify-center gap-1">
				<span>
					Step {currentStep} of {steps.length}
				</span>
				<Progress value={(currentStep / steps.length) * 100} />
			</div>
			<AnimatePresence mode="popLayout">
				<motion.div
					key={currentStep}
					initial={{ opacity: 0, x: 15 }}
					animate={{ opacity: 1, x: 0 }}
					exit={{ opacity: 0, x: -15 }}
					transition={{ duration: 0.4, type: "spring" }}
					className="flex flex-col gap-2"
				>
					{current?.stepFields?.map((field, i) => {
						// Check if field is a FormArray
						if (
							typeof field === "object" &&
							field !== null &&
							"arrayField" in field
						) {
							return (
								<div
									key={(field as unknown as FormElement).id + i}
									className="w-full"
								>
									<FormArrayPreview
										formArray={field as unknown as FormArray}
										index={i}
									/>
								</div>
							);
						}

						if (Array.isArray(field)) {
							return (
								<div
									key={i}
									className="flex items-center justify-between flex-wrap sm:flex-nowrap w-full gap-2"
								>
									{field.map((el, ii: number) => (
										<div key={el.name + ii} className="w-full">
											<RenderFormElement formElement={el} form={form} />
										</div>
									))}
								</div>
							);
						}
						return (
							<div key={i} className="w-full">
								<RenderFormElement formElement={field} form={form} />
							</div>
						);
					})}
				</motion.div>
			</AnimatePresence>
			<div className="flex items-center justify-between gap-3 w-full pt-3">
				<Button size="sm" variant="ghost" onClick={goToPrevious} type="button">
					<ChevronLeftIcon />
					Previous
				</Button>
				{isLastStep ? (
					<div className="flex items-center justify-end w-full pt-3 gap-3">
						{!isDefault && (
							<Button
								type="button"
								onClick={() => form.reset()}
								className="rounded-lg"
								variant="outline"
								size="sm"
							>
								Reset
							</Button>
						)}
						<Button
							size="sm"
							type="button"
							onClick={async (e) => {
								e.preventDefault();
								await form.handleSubmit();
							}}
							disabled={isSubmitting}
						>
							{isSubmitting
								? "Submitting..."
								: isSubmitted
									? "Submitted "
									: "Submit"}
						</Button>
					</div>
				) : (
					<div className="flex items-center justify-end w-full pt-3 gap-3">
						{!isDefault && (
							<Button
								type="button"
								onClick={() => form.reset()}
								className="rounded-lg"
								variant="outline"
								size="sm"
							>
								Reset
							</Button>
						)}
						<Button
							size="sm"
							type="button"
							variant={"secondary"}
							onClick={goToNext}
						>
							Next
							<ChevronRightIcon />
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}
