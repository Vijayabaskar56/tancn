import { revalidateLogic } from "@tanstack/react-form";
import { toast } from "sonner";
import * as z from "zod";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useAppForm } from "@/components/ui/tanstack-form";
import { Textarea } from "@/components/ui/textarea";

export const bookingFormSchema = z.object({
	firstName: z.string().min(1, "This field is required"),
	lastName: z.string().min(1, "This field is required"),
	email: z.email(),
	orderNumber: z.string().min(1, "This field is required").optional(),
	category: z.string().min(1, "This field is required"),
	priority: z.string().min(1, "This field is required"),
	description: z.string().min(1, "This field is required"),
});

export function BookingForm() {
	const bookingForm = useAppForm({
		defaultValues: {
			firstName: "",
			lastName: "",
			email: "",
			orderNumber: "",
			category: "technical",
			priority: "low",
			description: "",
		} as z.input<typeof bookingFormSchema>,
		validationLogic: revalidateLogic(),
		validators: {
			onDynamic: bookingFormSchema,
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
			<bookingForm.AppForm>
				<bookingForm.Form>
					<bookingForm.FieldLegend className="text-3xl font-bold">
						Customer Support Request
					</bookingForm.FieldLegend>
					<bookingForm.FieldDescription>
						We're here to help! Please describe your issue below.
					</bookingForm.FieldDescription>
					<bookingForm.FieldSeparator />
					<div className="flex items-center justify-between flex-wrap sm:flex-nowrap w-full gap-2">
						<bookingForm.AppField name={"firstName"}>
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
						</bookingForm.AppField>
						<bookingForm.AppField name={"lastName"}>
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
						</bookingForm.AppField>
					</div>
					<bookingForm.AppField name={"email"}>
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
					</bookingForm.AppField>
					<bookingForm.AppField name={"orderNumber"}>
						{(field) => (
							<field.FieldSet className="w-full">
								<field.Field>
									<field.FieldLabel htmlFor={"orderNumber"}>
										Order Number (if applicable){" "}
									</field.FieldLabel>
									<Input
										name={"orderNumber"}
										placeholder="Enter your order number"
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
					</bookingForm.AppField>
					<bookingForm.AppField name={"category"}>
						{(field) => {
							const options = [
								{ label: "Technical Issue", value: "technical" },
								{ label: "Billing Question", value: "billing" },
								{ label: "Product Inquiry", value: "product" },
								{ label: "Account Access", value: "account" },
								{ label: "Other", value: "other" },
							];
							return (
								<field.FieldSet className="w-full">
									<field.Field>
										<field.FieldLabel
											className="flex justify-between items-center"
											htmlFor={"category"}
										>
											Issue Category *
										</field.FieldLabel>
									</field.Field>
									<Select
										name={"category"}
										value={(field.state.value as string | undefined) ?? ""}
										onValueChange={field.handleChange}
										defaultValue={String(field?.state.value ?? "")}
										disabled={false}
										aria-invalid={!!field.state.meta.errors.length && field.state.meta.isTouched}
									>
										<field.Field>
											<SelectTrigger className="w-full">
												<SelectValue placeholder="Select Category" />
											</SelectTrigger>
										</field.Field>
										<SelectContent>
											{options.map(({ label, value }) => (
												<SelectItem key={value} value={value}>
													{label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>

									<field.FieldError />
								</field.FieldSet>
							);
						}}
					</bookingForm.AppField>
					<bookingForm.AppField name={"priority"}>
						{(field) => {
							const options = [
								{ label: "Low - General inquiry", value: "low" },
								{ label: "Medium - Issue affecting usage", value: "medium" },
								{ label: "High - Urgent issue", value: "high" },
							];
							return (
								<field.FieldSet className="flex flex-col gap-2 w-full py-1">
									<field.FieldLabel className="mt-0" htmlFor={"priority"}>
										Priority Level *
									</field.FieldLabel>

									<field.Field>
										<RadioGroup
											onValueChange={field.handleChange}
											name={"priority"}
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
					</bookingForm.AppField>
					<bookingForm.AppField name={"description"}>
						{(field) => (
							<field.FieldSet className="w-full">
								<field.Field>
									<field.FieldLabel htmlFor={"description"}>
										Issue Description *
									</field.FieldLabel>
									<Textarea
										placeholder="Please describe your issue in detail..."
										required={true}
										disabled={false}
										value={(field.state.value as string | undefined) ?? ""}
										name={"description"}
										onChange={(e) => field.handleChange(e.target.value)}
										onBlur={field.handleBlur}
										className="resize-none"
										aria-invalid={!!field.state.meta.errors.length && field.state.meta.isTouched}
									/>
								</field.Field>
								<field.FieldError />
							</field.FieldSet>
						)}
					</bookingForm.AppField>
					<div className="flex justify-end items-center w-full pt-3">
						<bookingForm.SubmitButton label="Submit" />
					</div>
				</bookingForm.Form>
			</bookingForm.AppForm>
		</div>
	);
}
