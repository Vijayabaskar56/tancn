import { revalidateLogic } from "@tanstack/react-form";
import * as z from "zod";
import {
	MultiSelect,
	MultiSelectContent,
	MultiSelectItem,
	MultiSelectList,
	MultiSelectTrigger,
	MultiSelectValue,
} from "@/components/ui/multi-select";
import { useAppForm } from "@/components/ui/tanstack-form";

const multiSelectFormSchema = z.object({
	multiselect: z.array(z.string()),
});
export function MultiSelectForm() {
	const multiSelectForm = useAppForm({
		defaultValues: {
			multiselect: [] as string[],
		} as z.input<typeof multiSelectFormSchema>,
		validationLogic: revalidateLogic(),
		validators: {
			onDynamic: multiSelectFormSchema,
			onDynamicAsyncDebounceMs: 300,
		},
		listeners: {
			onChange: ({ fieldApi }) => {
				console.log(fieldApi.state.value);
			},
		},
	});
	const options = [
		{ label: "Item 1", value: "1" },
		{ label: "Item 2", value: "2" },
	];
	return (
		<div>
			<multiSelectForm.AppForm>
				<multiSelectForm.Form>
					<multiSelectForm.AppField name={"multiselect"}>
						{(field) => (
							<>
								<field.FieldSet className="w-full">
									<field.Field>
										<field.FieldLabel htmlFor={"multiselect"}>
											Select multiple *
										</field.FieldLabel>
										<MultiSelect
											disabled={false}
											onValueChange={field.handleChange}
											aria-invalid={!!field.state.meta.errors.length && field.state.meta.isTouched}
										>
											<MultiSelectTrigger
												aria-invalid={!!field.state.meta.errors.length && field.state.meta.isTouched}
											>
												<MultiSelectValue placeholder="Select item" />
											</MultiSelectTrigger>
											<MultiSelectContent>
												<MultiSelectList>
													{options.map(({ label, value }) => (
														<MultiSelectItem key={value} value={value}>
															{label}
														</MultiSelectItem>
													))}
												</MultiSelectList>
											</MultiSelectContent>
										</MultiSelect>
										<field.FieldDescription>
											A multi-select dropdown.
										</field.FieldDescription>
										<field.FieldError />
									</field.Field>
								</field.FieldSet>
							</>
						)}
					</multiSelectForm.AppField>
				</multiSelectForm.Form>
			</multiSelectForm.AppForm>
		</div>
	);
}
