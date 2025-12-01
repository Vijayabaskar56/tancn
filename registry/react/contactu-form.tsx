import { revalidateLogic } from "@tanstack/react-form";
import { toast } from "sonner";
import * as z from "zod";
import { Checkbox } from "@/components/ui/checkbox";

import { Input } from "@/components/ui/input";
import { useAppForm } from "@/components/ui/tanstack-form";
import { Textarea } from "@/components/ui/textarea";

export const contacUsFormSchema = z.object({
	name: z.string().min(1, "This field is required"),
	email: z.email(),
	message: z.string().min(1, "This field is required"),
	agree: z.boolean(),
});
export function ContacUsForm() {
	const contacUsForm = useAppForm({
		defaultValues: {
			name: "",
			email: "",
			message: "",
			agree: false,
		} as z.input<typeof contacUsFormSchema>,
		validationLogic: revalidateLogic(),
		validators: {
			onDynamic: contacUsFormSchema,
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
			<contacUsForm.AppForm>
				<contacUsForm.Form>
					<contacUsForm.FieldLegend className="text-3xl font-bold">
						Contact us
					</contacUsForm.FieldLegend>
					<contacUsForm.FieldDescription>
						Please fill the form below to contact us
					</contacUsForm.FieldDescription>
					<contacUsForm.FieldSeparator />
					<div className="flex items-center justify-between flex-wrap sm:flex-nowrap w-full gap-2">
						<contacUsForm.AppField name={"name"}>
							{(field) => (
								<field.FieldSet className="w-full">
									<field.Field>
										<field.FieldLabel htmlFor={"name"}>Name *</field.FieldLabel>
										<Input
											name={"name"}
											placeholder="Enter your name"
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
						</contacUsForm.AppField>
						<contacUsForm.AppField name={"email"}>
							{(field) => (
								<field.FieldSet className="w-full">
									<field.Field>
										<field.FieldLabel htmlFor={"email"}>
											Email *
										</field.FieldLabel>
										<Input
											name={"email"}
											placeholder="Enter your email"
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
						</contacUsForm.AppField>
					</div>
					<contacUsForm.AppField name={"message"}>
						{(field) => (
							<field.FieldSet className="w-full">
								<field.Field>
									<field.FieldLabel htmlFor={"message"}>
										Message *
									</field.FieldLabel>
									<Textarea
										placeholder="Enter your message"
										required={true}
										disabled={false}
										value={(field.state.value as string | undefined) ?? ""}
										name={"message"}
										onChange={(e) => field.handleChange(e.target.value)}
										onBlur={field.handleBlur}
										className="resize-none"
										aria-invalid={!!field.state.meta.errors.length && field.state.meta.isTouched}
									/>
								</field.Field>
								<field.FieldError />
							</field.FieldSet>
						)}
					</contacUsForm.AppField>
					<contacUsForm.AppField name={"agree"}>
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
											htmlFor={"agree"}
										>
											I agree to the terms and conditions *
										</field.FieldLabel>

										<field.FieldError />
									</field.FieldContent>
								</field.Field>
							</field.FieldSet>
						)}
					</contacUsForm.AppField>
					<div className="flex justify-end items-center w-full pt-3">
						<contacUsForm.SubmitButton label="Submit" />
					</div>
				</contacUsForm.Form>
			</contacUsForm.AppForm>
		</div>
	);
}
