import { revalidateLogic } from "@tanstack/react-form";
import { toast } from "sonner";
import * as z from "zod";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldDescription, FieldLegend } from "@/components/ui/field";
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
	product: z.string().min(1, "This field is required"),
	firstName: z.string().min(1, "This field is required"),
	lastName: z.string().min(1, "This field is required"),
	email: z.email(),
	billingAddress: z.string().min(1, "This field is required"),
	paymentMethod: z.string().min(1, "This field is required"),
	terms: z.boolean(),
});

export function BookingForm() {
	const bookingForm = useAppForm({
		defaultValues: {
			product: "basic",
			firstName: "",
			lastName: "",
			email: "",
			billingAddress: "",
			paymentMethod: "credit",
			terms: false,
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
						Place Your Order
					</bookingForm.FieldLegend>
					<bookingForm.FieldDescription>
						Fill out the details below to complete your order
					</bookingForm.FieldDescription>
					<bookingForm.FieldSeparator />
					<bookingForm.AppField name={"product"}>
						{(field) => {
							const options = [
								{ label: "Basic Plan - $29/month", value: "basic" },
								{ label: "Pro Plan - $59/month", value: "pro" },
								{ label: "Enterprise Plan - $99/month", value: "enterprise" },
							];
							return (
								<field.FieldSet className="w-full">
									<field.Field>
										<field.FieldLabel
											className="flex justify-between items-center"
											htmlFor={"product"}
										>
											Select Product *
										</field.FieldLabel>
									</field.Field>
									<Select
										name={"product"}
										value={(field.state.value as string | undefined) ?? ""}
										onValueChange={field.handleChange}
										defaultValue={String(field?.state.value ?? "")}
										disabled={false}
										aria-invalid={!!field.state.meta.errors.length && field.state.meta.isTouched}
									>
										<field.Field>
											<SelectTrigger className="w-full">
												<SelectValue placeholder="Select Product" />
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
					<bookingForm.AppField name={"billingAddress"}>
						{(field) => (
							<field.FieldSet className="w-full">
								<field.Field>
									<field.FieldLabel htmlFor={"billingAddress"}>
										Billing Address *
									</field.FieldLabel>
									<Textarea
										placeholder="Enter your complete billing address"
										required={true}
										disabled={false}
										value={(field.state.value as string | undefined) ?? ""}
										name={"billingAddress"}
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
					<bookingForm.AppField name={"paymentMethod"}>
						{(field) => {
							const options = [
								{ label: "Credit Card", value: "credit" },
								{ label: "PayPal", value: "paypal" },
								{ label: "Bank Transfer", value: "bank" },
							];
							return (
								<field.FieldSet className="flex flex-col gap-2 w-full py-1">
									<field.FieldLabel className="mt-0" htmlFor={"paymentMethod"}>
										Payment Method *
									</field.FieldLabel>

									<field.Field>
										<RadioGroup
											onValueChange={field.handleChange}
											name={"paymentMethod"}
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
					<bookingForm.AppField name={"terms"}>
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
											htmlFor={"terms"}
										>
											I agree to the terms and conditions *
										</field.FieldLabel>

										<field.FieldError />
									</field.FieldContent>
								</field.Field>
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
