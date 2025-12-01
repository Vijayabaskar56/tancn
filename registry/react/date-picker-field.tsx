import { revalidateLogic } from "@tanstack/react-form";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { useAppForm } from "@/components/ui/tanstack-form";
import { cn } from "@/utils/utils";

const datePickerFormSchema = z.object({
	date: z.string(),
});
export function DatePickerForm() {
	const datePickerForm = useAppForm({
		defaultValues: {
			date: "",
		} as z.input<typeof datePickerFormSchema>,
		validationLogic: revalidateLogic(),
		validators: {
			onDynamic: datePickerFormSchema,
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
			<datePickerForm.AppForm>
				<datePickerForm.Form>
					<datePickerForm.AppField name={"date"}>
						{(field) => {
							const date = field.state.value
								? new Date(field.state.value as string)
								: undefined;
							return (
								<field.FieldSet className="flex flex-col w-full">
									<field.Field>
										<field.FieldLabel htmlFor={"date"}>
											Pick a date *
										</field.FieldLabel>
										<Popover>
											<PopoverTrigger
												asChild
												disabled={false}
												aria-invalid={!!field.state.meta.errors.length && field.state.meta.isTouched}
											>
												<Button
													variant={"outline"}
													className={cn(
														"w-full justify-start text-start font-normal",
														!date && "text-muted-foreground",
													)}
												>
													<CalendarIcon className="mr-2 size-4" />
													{date ? (
														format(date, "PPP")
													) : (
														<span>Pick a date</span>
													)}
												</Button>
											</PopoverTrigger>
											<PopoverContent className="w-auto p-0" align="start">
												<Calendar
													mode="single"
													selected={date}
													onSelect={(newDate) => {
														field.handleChange(
															newDate ? newDate.toISOString() : "",
														);
													}}
													aria-invalid={!!field.state.meta.errors.length && field.state.meta.isTouched}
												/>
											</PopoverContent>
										</Popover>
										<field.FieldDescription>
											A date picker component.
										</field.FieldDescription>
										<field.FieldError />
									</field.Field>
								</field.FieldSet>
							);
						}}
					</datePickerForm.AppField>
				</datePickerForm.Form>
			</datePickerForm.AppForm>
		</div>
	);
}
