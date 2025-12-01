import { revalidateLogic } from "@tanstack/react-form";
import { toast } from "sonner";
import * as z from "zod";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAppForm } from "@/components/ui/tanstack-form";
import { Textarea } from "@/components/ui/textarea";

export const eventRegistrationFormSchema = z.object({
	firstName: z.string().min(1, "This field is required"),
	lastName: z.string().min(1, "This field is required"),
	email: z.email(),
	company: z.string().min(1, "This field is required").optional(),
	ticketType: z.string().min(1, "This field is required"),
	comments: z.string().min(1, "This field is required").optional(),
});

export function EventRegistrationForm() {
	const eventRegistrationForm = useAppForm({
		defaultValues: {
			firstName: "",
			lastName: "",
			email: "",
			company: "",
			ticketType: "general",
			comments: "",
		} as z.input<typeof eventRegistrationFormSchema>,
		validationLogic: revalidateLogic(),
		validators: {
			onDynamic: eventRegistrationFormSchema,
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
			<eventRegistrationForm.AppForm>
				<eventRegistrationForm.Form>
					<eventRegistrationForm.FieldLegend className="text-3xl font-bold">
						Event Registration
					</eventRegistrationForm.FieldLegend>
					<eventRegistrationForm.FieldDescription>
						Register for our upcoming event
					</eventRegistrationForm.FieldDescription>
					<eventRegistrationForm.FieldSeparator />
					<div className="flex items-center justify-between flex-wrap sm:flex-nowrap w-full gap-2">
						<eventRegistrationForm.AppField name={"firstName"}>
							{(field) => (
								<field.FieldSet className="w-full">
									<field.Field>
										<field.FieldLabel htmlFor={"firstName"}>
											First Name *
										</field.FieldLabel>
										<Input
											name={"firstName"}
											placeholder="Enter your first name"
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
						</eventRegistrationForm.AppField>
						<eventRegistrationForm.AppField name={"lastName"}>
							{(field) => (
								<field.FieldSet className="w-full">
									<field.Field>
										<field.FieldLabel htmlFor={"lastName"}>
											Last Name *
										</field.FieldLabel>
										<Input
											name={"lastName"}
											placeholder="Enter your last name"
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
						</eventRegistrationForm.AppField>
					</div>
					<eventRegistrationForm.AppField name={"email"}>
						{(field) => (
							<field.FieldSet className="w-full">
								<field.Field>
									<field.FieldLabel htmlFor={"email"}>
										Email Address *
									</field.FieldLabel>
									<Input
										name={"email"}
										placeholder="Enter your email address"
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
					</eventRegistrationForm.AppField>
					<eventRegistrationForm.AppField name={"company"}>
						{(field) => (
							<field.FieldSet className="w-full">
								<field.Field>
									<field.FieldLabel htmlFor={"company"}>
										Company/Organization{" "}
									</field.FieldLabel>
									<Input
										name={"company"}
										placeholder="Enter your company name"
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
					</eventRegistrationForm.AppField>
					<eventRegistrationForm.AppField name={"ticketType"}>
						{(field) => {
							const options = [
								{ label: "General Admission - Free", value: "general" },
								{ label: "VIP Access - $99", value: "vip" },
								{ label: "Premium Package - $199", value: "premium" },
							];
							return (
								<field.FieldSet className="flex flex-col gap-2 w-full py-1">
									<field.FieldLabel className="mt-0" htmlFor={"ticketType"}>
										Ticket Type *
									</field.FieldLabel>

									<field.Field>
										<RadioGroup
											onValueChange={field.handleChange}
											name={"ticketType"}
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
							);
						}}
					</eventRegistrationForm.AppField>
					<eventRegistrationForm.AppField name={"comments"}>
						{(field) => (
							<field.FieldSet className="w-full">
								<field.Field>
									<field.FieldLabel htmlFor={"comments"}>
										Additional Comments{" "}
									</field.FieldLabel>
									<Textarea
										placeholder="Any special requirements or questions?"
										required={false}
										disabled={false}
										value={(field.state.value as string | undefined) ?? ""}
										name={"comments"}
										onChange={(e) => field.handleChange(e.target.value)}
										onBlur={field.handleBlur}
										className="resize-none"
										aria-invalid={!!field.state.meta.errors.length && field.state.meta.isTouched}
									/>
								</field.Field>
								<field.FieldError />
							</field.FieldSet>
						)}
					</eventRegistrationForm.AppField>
					<div className="flex justify-end items-center w-full pt-3">
						<eventRegistrationForm.SubmitButton label="Submit" />
					</div>
				</eventRegistrationForm.Form>
			</eventRegistrationForm.AppForm>
		</div>
	);
}
