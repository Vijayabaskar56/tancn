import { revalidateLogic } from "@tanstack/react-form";
import { toast } from "sonner";
import * as z from "zod";

import { Input } from "@/components/ui/input";
import { useAppForm } from "@/components/ui/tanstack-form";

const waitlistFormSchema = z.object({
	email: z.email(),
});

export function WaitlistForm() {
	const waitlistForm = useAppForm({
		defaultValues: {
			email: "",
		} as z.input<typeof waitlistFormSchema>,
		validationLogic: revalidateLogic(),
		validators: {
			onDynamic: waitlistFormSchema,
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
			<waitlistForm.AppForm>
				<waitlistForm.Form>
					<waitlistForm.FieldLegend className="text-3xl font-bold">
						Waitlist
					</waitlistForm.FieldLegend>
					<waitlistForm.FieldDescription>
						Join our waitlist to get early access
					</waitlistForm.FieldDescription>
					<waitlistForm.FieldSeparator />
					<waitlistForm.AppField name={"email"}>
						{(field) => (
							<field.FieldSet className="w-full">
								<field.Field>
									<field.FieldLabel htmlFor={"email"}>
										Your Email *
									</field.FieldLabel>
									<Input
										name={"email"}
										placeholder="Enter your Email"
										type="email"
										value={(field.state.value as string | undefined) ?? ""}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										aria-invalid={!!field.state.meta.errors.length && field.state.meta.isTouched}
									/>
								</field.Field>

								<field.FieldError />
							</field.FieldSet>
						)}
					</waitlistForm.AppField>
					<div className="flex justify-end items-center w-full pt-3">
						<waitlistForm.SubmitButton label="Submit" />
					</div>
				</waitlistForm.Form>
			</waitlistForm.AppForm>
		</div>
	);
}
