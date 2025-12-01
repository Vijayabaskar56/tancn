import { revalidateLogic } from "@tanstack/react-form";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { useAppForm } from "@/components/ui/tanstack-form";

const inputFormSchema = z.object({
	input: z.string(),
});
export function InputForm() {
	const inputForm = useAppForm({
		defaultValues: {
			input: "",
		} as z.input<typeof inputFormSchema>,
		validationLogic: revalidateLogic(),
		validators: {
			onDynamic: inputFormSchema,
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
			<inputForm.AppForm>
				<inputForm.Form>
					<inputForm.AppField name={"input"}>
						{(field) => (
							<field.FieldSet className="w-full">
								<field.Field>
									<field.FieldLabel htmlFor={"input"}>
										Input Field *
									</field.FieldLabel>
									<Input
										placeholder="Enter text"
										disabled={false}
										type="text"
										name={"input"}
										value={(field.state.value as string | undefined) ?? ""}
										onChange={(e) => {
											field.handleChange(e.target.value);
										}}
										onBlur={field.handleBlur}
										aria-invalid={!!field.state.meta.errors.length && field.state.meta.isTouched}
									/>
								</field.Field>
								<field.FieldDescription>
									A basic text input field.
								</field.FieldDescription>
								<field.FieldError />
							</field.FieldSet>
						)}
					</inputForm.AppField>
				</inputForm.Form>
			</inputForm.AppForm>
		</div>
	);
}
