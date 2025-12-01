import { revalidateLogic } from "@tanstack/react-form";
import * as z from "zod";
import { Slider } from "@/components/ui/slider";
import { useAppForm } from "@/components/ui/tanstack-form";

const sliderFormSchema = z.object({
	slider: z.number(),
});
export function SliderForm() {
	const sliderForm = useAppForm({
		defaultValues: {
			slider: 50,
		} as z.input<typeof sliderFormSchema>,
		validationLogic: revalidateLogic(),
		validators: {
			onDynamic: sliderFormSchema,
			onDynamicAsyncDebounceMs: 300,
		},
		listeners: {
			onChange: ({ fieldApi }) => {
				console.log(fieldApi.state.value);
			},
		},
	});
	return (
		<div>
			<sliderForm.AppForm>
				<sliderForm.Form>
					<sliderForm.AppField name={"slider"}>
						{(field) => {
							const min = 0;
							const max = 100;
							const step = 1;
							const currentValue = field.state.value;
							const sliderValue = Array.isArray(currentValue)
								? currentValue
								: [currentValue || 50];

							return (
								<field.FieldSet className="w-full">
									<field.Field>
										<field.FieldLabel
											className="flex justify-between items-center"
											htmlFor={"slider"}
										>
											Volume *
											<span className="text-sm text-muted-foreground">
												{sliderValue[0] || min} / {max}
											</span>
										</field.FieldLabel>
										<Slider
											name={"slider"}
											min={min}
											max={max}
											disabled={false}
											step={step}
											value={sliderValue}
											aria-invalid={!!field.state.meta.errors.length && field.state.meta.isTouched}
											onValueChange={(newValue) => {
												field.handleChange(newValue[0]);
												// Trigger validation by simulating blur
												field.handleBlur();
											}}
										/>
									</field.Field>
									<field.FieldDescription className="py-1">
										A range slider.
									</field.FieldDescription>
									<field.FieldError />
								</field.FieldSet>
							);
						}}
					</sliderForm.AppField>
				</sliderForm.Form>
			</sliderForm.AppForm>
		</div>
	);
}
