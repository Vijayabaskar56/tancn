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

export const jobApplicationFormSchema = z.object({
	firstName: z.string().min(1, "This field is required"),
	lastName: z.string().min(1, "This field is required"),
	email: z.email(),
	githubUrl: z.string().min(1, "This field is required").optional(),
	linkedinUrl: z.string().min(1, "This field is required").optional(),
	position: z.string().min(1, "This field is required"),
	experience: z.string().min(1, "This field is required"),
	coverLetter: z.string().min(1, "This field is required").optional(),
});

export function JobApplicationForm() {
	const jobApplicationForm = useAppForm({
		defaultValues: {
			firstName: "",
			lastName: "",
			email: "",
			githubUrl: "",
			linkedinUrl: "",
			position: "frontend",
			experience: "0-1",
			coverLetter: "",
		} as z.input<typeof jobApplicationFormSchema>,
		validationLogic: revalidateLogic(),
		validators: {
			onDynamic: jobApplicationFormSchema,
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
			<jobApplicationForm.AppForm>
				<jobApplicationForm.Form>
					<jobApplicationForm.FieldLegend className="text-3xl font-bold">
						Job Application
					</jobApplicationForm.FieldLegend>
					<jobApplicationForm.FieldDescription>
						Please fill out the form below to apply for this position
					</jobApplicationForm.FieldDescription>
					<jobApplicationForm.FieldSeparator />
					<div className="flex items-center justify-between flex-wrap sm:flex-nowrap w-full gap-2">
						<jobApplicationForm.AppField name={"firstName"}>
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
						</jobApplicationForm.AppField>
						<jobApplicationForm.AppField name={"lastName"}>
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
						</jobApplicationForm.AppField>
					</div>
					<jobApplicationForm.AppField name={"email"}>
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
					</jobApplicationForm.AppField>
					<jobApplicationForm.AppField name={"githubUrl"}>
						{(field) => (
							<field.FieldSet className="w-full">
								<field.Field>
									<field.FieldLabel htmlFor={"githubUrl"}>
										GitHub URL{" "}
									</field.FieldLabel>
									<Input
										name={"githubUrl"}
										placeholder="Enter your GitHub URL"
										type="url"
										value={(field.state.value as string | undefined) ?? ""}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										aria-invalid={!!field.state.meta.errors.length && field.state.meta.isTouched}
									/>
								</field.Field>

								<field.FieldError />
							</field.FieldSet>
						)}
					</jobApplicationForm.AppField>
					<jobApplicationForm.AppField name={"linkedinUrl"}>
						{(field) => (
							<field.FieldSet className="w-full">
								<field.Field>
									<field.FieldLabel htmlFor={"linkedinUrl"}>
										LinkedIn URL{" "}
									</field.FieldLabel>
									<Input
										name={"linkedinUrl"}
										placeholder="Enter your LinkedIn URL"
										type="url"
										value={(field.state.value as string | undefined) ?? ""}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										aria-invalid={!!field.state.meta.errors.length && field.state.meta.isTouched}
									/>
								</field.Field>

								<field.FieldError />
							</field.FieldSet>
						)}
					</jobApplicationForm.AppField>
					<jobApplicationForm.AppField name={"position"}>
						{(field) => {
							const options = [
								{ label: "Frontend Developer", value: "frontend" },
								{ label: "Backend Developer", value: "backend" },
								{ label: "Full Stack Developer", value: "fullstack" },
								{ label: "UI/UX Designer", value: "designer" },
								{ label: "Product Manager", value: "pm" },
							];
							return (
								<field.FieldSet className="flex flex-col gap-2 w-full py-1">
									<field.FieldLabel className="mt-0" htmlFor={"position"}>
										Which position are you applying for? *
									</field.FieldLabel>

									<field.Field>
										<RadioGroup
											onValueChange={field.handleChange}
											name={"position"}
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
					</jobApplicationForm.AppField>
					<jobApplicationForm.AppField name={"experience"}>
						{(field) => {
							const options = [
								{ label: "0-1 years", value: "0-1" },
								{ label: "2-3 years", value: "2-3" },
								{ label: "4-5 years", value: "4-5" },
								{ label: "6-10 years", value: "6-10" },
								{ label: "10+ years", value: "10+" },
							];
							return (
								<field.FieldSet className="w-full">
									<field.Field>
										<field.FieldLabel
											className="flex justify-between items-center"
											htmlFor={"experience"}
										>
											Years of Experience *
										</field.FieldLabel>
									</field.Field>
									<Select
										name={"experience"}
										value={(field.state.value as string | undefined) ?? ""}
										onValueChange={field.handleChange}
										defaultValue={String(field?.state.value ?? "")}
										disabled={false}
										aria-invalid={!!field.state.meta.errors.length && field.state.meta.isTouched}
									>
										<field.Field>
											<SelectTrigger className="w-full">
												<SelectValue placeholder="Select Experience" />
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
					</jobApplicationForm.AppField>
					<jobApplicationForm.AppField name={"coverLetter"}>
						{(field) => (
							<field.FieldSet className="w-full">
								<field.Field>
									<field.FieldLabel htmlFor={"coverLetter"}>
										Cover Letter{" "}
									</field.FieldLabel>
									<Textarea
										placeholder="Tell us why you're interested in this position..."
										required={false}
										disabled={false}
										value={(field.state.value as string | undefined) ?? ""}
										name={"coverLetter"}
										onChange={(e) => field.handleChange(e.target.value)}
										onBlur={field.handleBlur}
										className="resize-none"
										aria-invalid={!!field.state.meta.errors.length && field.state.meta.isTouched}
									/>
								</field.Field>
								<field.FieldError />
							</field.FieldSet>
						)}
					</jobApplicationForm.AppField>
					<div className="flex justify-end items-center w-full pt-3">
						<jobApplicationForm.SubmitButton label="Submit" />
					</div>
				</jobApplicationForm.Form>
			</jobApplicationForm.AppForm>
		</div>
	);
}
