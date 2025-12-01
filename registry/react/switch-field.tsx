import { revalidateLogic } from "@tanstack/react-form";
import * as z from "zod";
import { Switch } from "@/components/ui/switch";
import { useAppForm } from "@/components/ui/tanstack-form";

const switchFormSchema = z.object({
	switch: z.boolean(),
});
export function SwitchForm() {
	const switchForm = useAppForm({
		defaultValues: {
			switch: false,
		} as z.input<typeof switchFormSchema>,
		validationLogic: revalidateLogic(),
		validators: {
			onDynamic: switchFormSchema,
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
			<switchForm.AppForm>
				<switchForm.Form>
					<switchForm.AppField name={"switch"}>
						{(field) => (
							<field.FieldSet className="flex flex-col p-3 justify-center w-full border rounded">
								<field.Field orientation="horizontal">
									<field.FieldContent>
										<field.FieldLabel htmlFor={"switch"}>
											Enable notifications
										</field.FieldLabel>
										<field.FieldDescription>
											A toggle switch.
										</field.FieldDescription>
									</field.FieldContent>
									<Switch
										name={"switch"}
										checked={Boolean(field.state.value)}
										onCheckedChange={(checked) => {
											field.handleChange(checked);
											// Trigger validation by simulating blur
											field.handleBlur();
										}}
										disabled={false}
										aria-invalid={!!field.state.meta.errors.length && field.state.meta.isTouched}
									/>
								</field.Field>
							</field.FieldSet>
						)}
					</switchForm.AppField>
				</switchForm.Form>
			</switchForm.AppForm>
		</div>
	);
}
