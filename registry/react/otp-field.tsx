import { revalidateLogic } from "@tanstack/react-form";
import * as z from "zod";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSeparator,
	InputOTPSlot,
} from "@/components/ui/input-otp";
import { useAppForm } from "@/components/ui/tanstack-form";

const otpFormSchema = z.object({
	otp: z.string(),
});
export function OTPForm() {
	const otpForm = useAppForm({
		defaultValues: {
			otp: "",
		} as z.input<typeof otpFormSchema>,
		validationLogic: revalidateLogic(),
		validators: {
			onDynamic: otpFormSchema,
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
			<otpForm.AppForm>
				<otpForm.Form>
					<otpForm.AppField name={"otp"}>
						{(field) => (
							<field.FieldSet className="w-full">
								<field.Field>
									<field.FieldLabel htmlFor={"otp"}>OTP *</field.FieldLabel>
									<InputOTP
										maxLength={6}
										name={"otp"}
										value={(field.state.value as string | undefined) ?? ""}
										onChange={field.handleChange}
										required={true}
										disabled={false}
										aria-invalid={!!field.state.meta.errors.length && field.state.meta.isTouched}
									>
										<InputOTPGroup>
											<InputOTPSlot index={0} />
											<InputOTPSlot index={1} />
											<InputOTPSlot index={2} />
										</InputOTPGroup>
										<InputOTPSeparator />
										<InputOTPGroup>
											<InputOTPSlot index={3} />
											<InputOTPSlot index={4} />
											<InputOTPSlot index={5} />
										</InputOTPGroup>
									</InputOTP>
								</field.Field>
								<field.FieldDescription>
									One-time password input.
								</field.FieldDescription>
								<field.FieldError />
							</field.FieldSet>
						)}
					</otpForm.AppField>
				</otpForm.Form>
			</otpForm.AppForm>
		</div>
	);
}
