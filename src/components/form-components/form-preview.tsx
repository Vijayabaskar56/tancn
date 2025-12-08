import { FormArrayPreview } from "@/components/form-components/form-array-preview";
import { MultiStepFormPreview } from "@/components/form-components/multi-step-preview";
import { RenderFormElement } from "@/components/form-components/render-form-element";
import NoFieldPlaceholder from "@/components/no-field-placeholder";
import { Button } from "@/components/ui/button";
import { useFormBuilder } from "@/hooks/use-form-builder";
import useFormBuilderState from "@/hooks/use-form-builder-state";
import type { FormArray, FormElement } from "@/db-collections/form-builder.collections";

export function SingleStepFormPreview() {
	const { formElements, formName, isMS } = useFormBuilderState();
	const { form, isDefault } = useFormBuilder();
	if (!formElements || formElements.length < 1)
		return (
			<NoFieldPlaceholder
				title="No Field To Preview Yet"
				description="	You haven&apos;t added any form elements yet. Get started by
				creating your first form element."
			/>
		);
	return (
		<div className="w-full animate-in rounded-md">
			<form.AppForm>
				<form.Form id={formName} noValidate>
					{isMS ? (
						<MultiStepFormPreview />
					) : (
						formElements.map((element, i) => {
							// Check if element is a FormArray
							if (
								typeof element === "object" &&
								element !== null &&
								"arrayField" in element
							) {
								return (
									<div key={element.id} className="w-full">
										<FormArrayPreview
											formArray={element as FormArray}
											index={i}
										/>
									</div>
								);
							}

							if (Array.isArray(element)) {
								return (
									<div
										key={element[i]?.id ?? i}
										className="flex items-start flex-wrap sm:flex-nowrap w-full gap-2"
									>
										{element.map((el) => (
											<div
												key={(el as FormElement)?.name}
												className="flex-1 min-w-0"
											>
												<RenderFormElement
													formElement={el as FormElement}
													form={form}
												/>
											</div>
										))}
									</div>
								);
							}
							return (
								<div key={(element as FormElement)?.name} className="w-full">
									<RenderFormElement
										formElement={element as FormElement}
										form={form}
									/>
								</div>
							);
						})
					)}
					{!isMS && (
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
							<Button type="submit" className="rounded-lg" size="sm">
								{form.baseStore.state.isSubmitting
									? "Submitting..."
									: form.baseStore.state.isSubmitted
										? "Submitted"
										: "Submit"}
							</Button>
						</div>
					)}
				</form.Form>
			</form.AppForm>
		</div>
	);
}
