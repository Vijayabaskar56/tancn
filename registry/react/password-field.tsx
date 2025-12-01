import { revalidateLogic } from "@tanstack/react-form";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import * as z from "zod";
import { useAppForm } from "@/components/ui/tanstack-form";

const passwordFormSchema = z.object({
	password: z.string(),
});
export function PasswordForm() {
	const passwordForm = useAppForm({
		defaultValues: {
			password: "",
		} as z.input<typeof passwordFormSchema>,
		validationLogic: revalidateLogic(),
		validators: {
			onDynamic: passwordFormSchema,
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
			<passwordForm.AppForm>
				<passwordForm.Form>
					<passwordForm.AppField name={"password"}>
						{(field) => (
							<field.FieldSet className="w-full">
								<field.FieldLabel htmlFor={"password"}>
									Password *
								</field.FieldLabel>
								<field.Field orientation="horizontal">
									<field.InputGroup>
										<field.InputGroupInput
											id={"password"}
											placeholder="Enter password"
											disabled={false}
											type={"password"}
											name={"password"}
											value={(field.state.value as string | undefined) ?? ""}
											onChange={(e) => field.handleChange(e.target.value)}
											onBlur={field.handleBlur}
											aria-invalid={!!field.state.meta.errors.length && field.state.meta.isTouched}
										/>
										<field.InputGroupAddon align="inline-end">
											<button
												type="button"
												className="cursor-pointer flex items-center justify-center p-1 hover:bg-gray-100 rounded transition-colors"
												onClick={(e) => {
													const input =
														e.currentTarget.parentElement?.parentElement?.querySelector(
															"input",
														) as HTMLInputElement;
													if (input) {
														input.type =
															input.type === "password" ? "text" : "password";
														// Toggle the button's data attribute for icon switching
														const button = e.currentTarget;
														button.setAttribute(
															"data-show",
															input.type === "text" ? "true" : "false",
														);
													}
												}}
												data-show="false"
											>
												<EyeIcon className="size-3 data-[show=true]:hidden" />
												<EyeOffIcon className="size-3 hidden data-[show=true]:block" />
											</button>
										</field.InputGroupAddon>
									</field.InputGroup>
								</field.Field>
								<field.FieldDescription>
									A password input with visibility toggle.
								</field.FieldDescription>
								<field.FieldError />
							</field.FieldSet>
						)}
					</passwordForm.AppField>
				</passwordForm.Form>
			</passwordForm.AppForm>
		</div>
	);
}
