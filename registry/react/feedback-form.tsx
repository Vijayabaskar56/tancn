import { revalidateLogic } from "@tanstack/react-form";
import { toast } from "sonner";
import * as z from "zod";

import { useAppForm } from "@/components/ui/tanstack-form";
import { Textarea } from "@/components/ui/textarea";

const feedBackSchema = z.object({
	comment: z.string().min(1, "This field is required"),
});

export function FeedbackForm() {
	const feedBack = useAppForm({
		defaultValues: {
			comment: "",
		} as z.input<typeof feedBackSchema>,
		validationLogic: revalidateLogic(),
		validators: {
			onDynamic: feedBackSchema,
			onDynamicAsyncDebounceMs: 300,
		},
		onSubmit: ({}) => {
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
			<feedBack.AppForm>
				<feedBack.Form>
					<feedBack.FieldLegend className="text-3xl font-bold">
						Feedback Form
					</feedBack.FieldLegend>
					<feedBack.FieldDescription>
						Please provide your feedback
					</feedBack.FieldDescription>
					<feedBack.FieldSeparator />
					<feedBack.AppField name={"comment"}>
						{(field) => (
							<field.FieldSet className="w-full">
								<field.Field>
									<field.FieldLabel htmlFor={"comment"}>
										Feedback Comment *
									</field.FieldLabel>
									<Textarea
										placeholder="Share your feedback"
										required={true}
										disabled={false}
										value={(field.state.value as string | undefined) ?? ""}
										name={"comment"}
										onChange={(e) => field.handleChange(e.target.value)}
										onBlur={field.handleBlur}
										className="resize-none"
										aria-invalid={!!field.state.meta.errors.length && field.state.meta.isTouched}
									/>
								</field.Field>
								<field.FieldError />
							</field.FieldSet>
						)}
					</feedBack.AppField>
					<div className="flex justify-end items-center w-full pt-3">
						<feedBack.SubmitButton label="Submit" />
					</div>
				</feedBack.Form>
			</feedBack.AppForm>
		</div>
	);
}
