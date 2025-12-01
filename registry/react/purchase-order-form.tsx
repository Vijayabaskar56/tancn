import { revalidateLogic } from "@tanstack/react-form";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
	FieldDescription,
	FieldLegend,
	FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { useAppForm } from "@/components/ui/tanstack-form";

export const purchaseOrderForm = z.object({
	orderNumber: z.string().min(1, "This field is required"),
	customerName: z.string().min(1, "This field is required"),
	items: z.array(
		z.object({
			itemName: z.string().min(1, "This field is required"),
			quantity: z
				.number()
				.min(1, "Must be at least 1")
				.max(50, "Must be at most 50"),
		}),
	),
});

export function PurchaseOrderForm() {
	const orderForm = useAppForm({
		defaultValues: {
			orderNumber: "",
			customerName: "",
			items: [
				{
					itemName: "",
					quantity: 1,
				},
			],
		} as z.input<typeof purchaseOrderForm>,
		validationLogic: revalidateLogic(),
		validators: {
			onDynamic: purchaseOrderForm,
			onDynamicAsyncDebounceMs: 300,
		},
		onSubmit: ({ value }) => {
			toast.success("success");
		},
		onSubmitInvalid({ formApi }) {
			const errorMap = formApi.state.errorMap["onDynamic"]!;
			const inputs = Array.from(
				document.querySelectorAll("#previewForm input"),
			) as HTMLInputElement[];
			let firstInput: HTMLInputElement | undefined;
			for (const input of inputs) {
				if (errorMap[input.name]) {
					firstInput = input;
					break;
				}
			}
			firstInput?.focus();
		},
	});
	return (
		<div>
			<orderForm.AppForm>
				<orderForm.Form>
					<FieldLegend>Purchase Order</FieldLegend>
					<FieldDescription>
						Create a purchase order with multiple items
					</FieldDescription>
					<FieldSeparator />
					<orderForm.AppField name={"orderNumber"}>
						{(field) => (
							<field.FieldSet className="w-full">
								<field.Field>
									<field.FieldLabel htmlFor={"orderNumber"}>
										Order Number *
									</field.FieldLabel>
									<Input
										name={"orderNumber"}
										placeholder="Enter order number"
										type="text"
										value={(field.state.value as string | undefined) ?? ""}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										aria-invalid={!!field.state.meta.errors.length && field.state.meta.isTouched}
									/>
								</field.Field>

								<field.FieldError />
							</field.FieldSet>
						)}
					</orderForm.AppField>
					<orderForm.AppField name={"customerName"}>
						{(field) => (
							<field.FieldSet className="w-full">
								<field.Field>
									<field.FieldLabel htmlFor={"customerName"}>
										Customer Name *
									</field.FieldLabel>
									<Input
										name={"customerName"}
										placeholder="Enter your text"
										type="text"
										value={(field.state.value as string | undefined) ?? ""}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										aria-invalid={!!field.state.meta.errors.length && field.state.meta.isTouched}
									/>
								</field.Field>

								<field.FieldError />
							</field.FieldSet>
						)}
					</orderForm.AppField>
					{orderForm.AppField({
						name: "items",
						mode: "array",
						children: (field) => (
							<div className="w-full space-y-4">
								{field.state.value.map((_, index) => (
									<div key={index} className="space-y-3 p-4 relative">
										<Separator />
										<orderForm.AppField name={`items[${index}].itemName`}>
											{(field) => (
												<field.FieldSet className="w-full">
													<field.Field>
														<field.FieldLabel
															htmlFor={`items[${index}].itemName`}
														>
															Item Name *
														</field.FieldLabel>
														<Input
															name={`items[${index}].itemName`}
															placeholder="Enter item name"
															type="text"
															value={
																(field.state.value as string | undefined) ?? ""
															}
															onBlur={field.handleBlur}
															onChange={(e) =>
																field.handleChange(e.target.value)
															}
															aria-invalid={!!field.state.meta.errors.length && field.state.meta.isTouched}
														/>
													</field.Field>

													<field.FieldError />
												</field.FieldSet>
											)}
										</orderForm.AppField>

										<orderForm.AppField name={`items[${index}].quantity`}>
											{(field) => {
												const min = 1;
												const max = 50;
												const step = 3;
												const defaultSliderValue = min;
												const currentValue = field.state.value;
												const sliderValue = Array.isArray(currentValue)
													? currentValue
													: [currentValue || defaultSliderValue];

												return (
													<field.FieldSet className="w-full">
														<field.Field>
															<field.FieldLabel
																className="flex justify-between items-center"
																htmlFor={`items[${index}].quantity`}
															>
																Quantity *
																<span className="text-sm text-muted-foreground">
																	{sliderValue[0] || min} / {max}
																</span>
															</field.FieldLabel>
															<Slider
																name={`items[${index}].quantity`}
																min={min}
																max={max}
																disabled={false}
																step={step}
																value={sliderValue}
																aria-invalid={!!field.state.meta.errors.length && field.state.meta.isTouched}
																onValueChange={(newValue) => {
																	field.handleChange(newValue[0]);
																	field.handleBlur();
																}}
															/>
														</field.Field>
														<field.FieldDescription className="py-1">
															Adjust the range by sliding.
														</field.FieldDescription>
														<field.FieldError />
													</field.FieldSet>
												);
											}}
										</orderForm.AppField>
									</div>
								))}
								<div className="flex justify-between pt-2">
									<Button
										variant="outline"
										type="button"
										onClick={() =>
											field.pushValue(
												{
													itemName: "",
													quantity: 1,
												},
												{ dontValidate: true },
											)
										}
									>
										<Plus className="h-4 w-4 mr-2" /> Add
									</Button>
									<Button
										variant="outline"
										type="button"
										onClick={() =>
											field.removeValue(field.state.value.length - 1)
										}
										disabled={field.state.value.length <= 1}
									>
										<Trash2 className="h-4 w-4 mr-2" /> Remove
									</Button>
								</div>
							</div>
						),
					})}
					<div className="flex justify-end items-center w-full pt-3">
						<orderForm.SubmitButton label="Submit" />
					</div>
				</orderForm.Form>
			</orderForm.AppForm>
		</div>
	);
}
