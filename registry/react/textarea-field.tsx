import { revalidateLogic } from "@tanstack/react-form";
import * as z from "zod";
import { useAppForm } from "@/components/ui/tanstack-form";
import { Textarea } from "@/components/ui/textarea";

const textareaFormSchema = z.object({
	textarea: z.string(),
});
export function TextareaForm() {
	const textareaForm = useAppForm({
		defaultValues: {
			textarea: "",
		} as z.input<typeof textareaFormSchema>,
		validationLogic: revalidateLogic(),
		validators: {
			onDynamic: textareaFormSchema,
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
			<textareaForm.AppForm>
				<textareaForm.Form>
					<textareaForm.AppField name={"textarea"}>
						{(field) => (
							<field.FieldSet className="w-full">
								<field.Field>
									<field.FieldLabel htmlFor={"textarea"}>
										Textarea *
									</field.FieldLabel>
									<Textarea
										placeholder="Enter text"
										required={true}
										disabled={false}
										value={(field.state.value as string | undefined) ?? ""}
										name={"textarea"}
										onChange={(e) => field.handleChange(e.target.value)}
										onBlur={field.handleBlur}
										className="resize-none"
										aria-invalid={!!field.state.meta.errors.length && field.state.meta.isTouched}
									/>
									<field.FieldDescription>
										A multi-line text input.
									</field.FieldDescription>
								</field.Field>
								<field.FieldError />
							</field.FieldSet>
						)}
					</textareaForm.AppField>
				</textareaForm.Form>
			</textareaForm.AppForm>
		</div>
	);
}
