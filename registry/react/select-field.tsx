import { revalidateLogic } from "@tanstack/react-form";
import * as z from "zod";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useAppForm } from "@/components/ui/tanstack-form";

const selectFormSchema = z.object({
	select: z.string(),
});
export function SelectForm() {
	const selectForm = useAppForm({
		defaultValues: {
			select: "",
		} as z.input<typeof selectFormSchema>,
		validationLogic: revalidateLogic(),
		validators: {
			onDynamic: selectFormSchema,
			onDynamicAsyncDebounceMs: 300,
		},
		listeners: {
			onChange: ({ fieldApi }) => {
				console.log(fieldApi.state.value);
			},
		},
	});
	const options = [
		{ label: "Option A", value: "a" },
		{ label: "Option B", value: "b" },
	];
	return (
		<div>
			<selectForm.AppForm>
				<selectForm.Form>
					<selectForm.AppField name={"select"}>
						{(field) => (
							<field.FieldSet className="w-full">
								<field.Field>
									<field.FieldLabel
										className="flex justify-between items-center"
										htmlFor={"select"}
									>
										Select option *
									</field.FieldLabel>
								</field.Field>
								<Select
									name={"select"}
									value={(field.state.value as string | undefined) ?? ""}
									onValueChange={field.handleChange}
									defaultValue={String(field?.state.value ?? "")}
									disabled={false}
									aria-invalid={!!field.state.meta.errors.length && field.state.meta.isTouched}
								>
									<field.Field>
										<SelectTrigger className="w-full">
											<SelectValue placeholder="Select item" />
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
								<field.FieldDescription>
									A dropdown select.
								</field.FieldDescription>
								<field.FieldError />
							</field.FieldSet>
						)}
					</selectForm.AppField>
				</selectForm.Form>
			</selectForm.AppForm>
		</div>
	);
}
