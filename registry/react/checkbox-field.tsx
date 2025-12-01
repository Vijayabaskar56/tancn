import { revalidateLogic } from "@tanstack/react-form";
import * as z from "zod";
import { Checkbox } from "@/components/ui/checkbox";
import { useAppForm } from "@/components/ui/tanstack-form";

const checkboxFormSchema = z.object({
	checkbox: z.boolean(),
});
export function CheckboxForm() {
	const checkboxForm = useAppForm({
		defaultValues: {
			checkbox: false,
		} as z.input<typeof checkboxFormSchema>,
		validationLogic: revalidateLogic(),
		validators: {
			onDynamic: checkboxFormSchema,
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
			<checkboxForm.AppForm>
				<checkboxForm.Form>
					<checkboxForm.AppField name={"checkbox"}>
						{(field) => (
							<field.FieldSet>
								<field.Field orientation="horizontal">
									<Checkbox
										checked={Boolean(field.state.value)}
										onCheckedChange={(checked) =>
											field.handleChange(checked as boolean)
										}
										disabled={false}
										aria-invalid={!!field.state.meta.errors.length && field.state.meta.isTouched}
									/>
									<field.FieldContent>
										<field.FieldLabel
											className="space-y-1 leading-none"
											htmlFor={"checkbox"}
										>
											Accept the Terms & Conditions *
										</field.FieldLabel>
										<field.FieldDescription>
											By clicking continue, you agree to our Terms of Service
											and Privacy Policy.
										</field.FieldDescription>
										<field.FieldError />
									</field.FieldContent>
								</field.Field>
							</field.FieldSet>
						)}
					</checkboxForm.AppField>
				</checkboxForm.Form>
			</checkboxForm.AppForm>
		</div>
	);
}
