import { revalidateLogic } from "@tanstack/react-form";
import * as z from "zod";
import { useAppForm } from "@/components/ui/tanstack-form";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const toggleGroupFormSchema = z.object({
	toggle: z.array(z.string()),
});
export function ToggleGroupForm() {
	const toggleGroupForm = useAppForm({
		defaultValues: {
			toggle: [] as string[],
		} as z.input<typeof toggleGroupFormSchema>,
		validationLogic: revalidateLogic(),
		validators: {
			onDynamic: toggleGroupFormSchema,
			onDynamicAsyncDebounceMs: 300,
		},
		listeners: {
			onChange: ({ fieldApi }) => {
				console.log(fieldApi.state.value);
			},
		},
	});
	const options = [
		{ label: "Tech", value: "tech" },
		{ label: "Design", value: "design" },
	];
	const toggleOptions = options.map(({ label, value }) => (
		<ToggleGroupItem
			name={"toggle"}
			value={value}
			key={value}
			disabled={false}
			className="flex items-center gap-x-2 px-1"
		>
			{label}
		</ToggleGroupItem>
	));
	return (
		<div>
			<toggleGroupForm.AppForm>
				<toggleGroupForm.Form>
					<toggleGroupForm.AppField name={"toggle"}>
						{(field) => (
							<field.FieldSet className="flex flex-col gap-2 w-full py-1">
								<field.Field>
									<field.FieldLabel className="mt-0" htmlFor={"toggle"}>
										Select interests *
									</field.FieldLabel>
									<ToggleGroup
										type="multiple"
										variant="outline"
										onValueChange={field.handleChange}
										defaultValue={[]}
										className="flex justify-start items-center w-full"
										aria-invalid={!!field.state.meta.errors.length && field.state.meta.isTouched}
									>
										{toggleOptions}
									</ToggleGroup>
								</field.Field>
								<field.FieldDescription>
									A group of toggle buttons.
								</field.FieldDescription>
								<field.FieldError />
							</field.FieldSet>
						)}
					</toggleGroupForm.AppField>
				</toggleGroupForm.Form>
			</toggleGroupForm.AppForm>
		</div>
	);
}
