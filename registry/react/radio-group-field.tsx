import { revalidateLogic } from "@tanstack/react-form";
import * as z from "zod";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAppForm } from "@/components/ui/tanstack-form";

const radioGroupFormSchema = z.object({
	radio: z.string(),
});
export function RadioGroupForm() {
	const radioGroupForm = useAppForm({
		defaultValues: {
			radio: "",
		} as z.input<typeof radioGroupFormSchema>,
		validationLogic: revalidateLogic(),
		validators: {
			onDynamic: radioGroupFormSchema,
			onDynamicAsyncDebounceMs: 300,
		},
		listeners: {
			onChange: ({ fieldApi }) => {
				console.log(fieldApi.state.value);
			},
		},
	});
	const options = [
		{ label: "Option 1", value: "1" },
		{ label: "Option 2", value: "2" },
	];
	return (
		<div>
			<radioGroupForm.AppForm>
				<radioGroupForm.Form>
					<radioGroupForm.AppField name={"radio"}>
						{(field) => (
							<field.FieldSet className="flex flex-col gap-2 w-full py-1">
								<field.FieldLabel className="mt-0" htmlFor={"radio"}>
									Choose option *
								</field.FieldLabel>
								<field.FieldDescription>
									A group of radio buttons.
								</field.FieldDescription>
								<field.Field>
									<RadioGroup
										onValueChange={field.handleChange}
										name={"radio"}
										value={(field.state.value as string | undefined) ?? ""}
										disabled={false}
										aria-invalid={!!field.state.meta.errors.length && field.state.meta.isTouched}
									>
										{options.map(({ label, value }) => (
											<div key={value} className="flex items-center gap-x-2">
												<RadioGroupItem
													value={value}
													id={value}
													required={true}
												/>
												<Label htmlFor={value}>{label}</Label>
											</div>
										))}
									</RadioGroup>
								</field.Field>
								<field.FieldError />
							</field.FieldSet>
						)}
					</radioGroupForm.AppField>
				</radioGroupForm.Form>
			</radioGroupForm.AppForm>
		</div>
	);
}
