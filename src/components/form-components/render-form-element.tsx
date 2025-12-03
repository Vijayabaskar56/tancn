import { format } from "date-fns";
import { CalendarIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import type * as React from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSeparator,
	InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import {
	MultiSelect,
	MultiSelectContent,
	MultiSelectItem,
	MultiSelectList,
	MultiSelectTrigger,
	MultiSelectValue,
} from "@/components/ui/multi-select";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { FormElement } from "@/types/form-types";
import { cn } from "@/utils/utils";
import type { AppForm } from "../../hooks/use-form-builder";
import { FieldDescription, FieldLegend, FieldSeparator } from "../ui/field";
export const RenderFormElement = ({
	formElement,
	form,
}: {
	formElement: FormElement;
	form: AppForm;
}): React.ReactElement => {
	switch (formElement.fieldType) {
		case "Input":
			return (
				<form.AppField name={formElement.name}>
					{(field) => (
						<field.FieldSet className="w-full">
							<field.Field>
								<field.FieldLabel htmlFor={formElement.name}>
									{formElement.label}{" "}
									{formElement.required ? (
										<span className="text-red-500">*</span>
									) : (
										""
									)}
								</field.FieldLabel>
								<Input
									placeholder={formElement.placeholder}
									disabled={formElement.disabled}
									type={formElement.type ?? "text"}
									name={formElement.name}
									value={(field.state.value as string | undefined) ?? ""}
									onChange={(e) => {
										field.handleChange(e.target.value);
									}}
									onBlur={field.handleBlur}
									aria-invalid={
										!!field.state.meta.errors.length &&
										field.state.meta.isTouched
									}
								/>
							</field.Field>
							<field.FieldDescription>
								{formElement.description}
							</field.FieldDescription>
							<field.FieldError />
						</field.FieldSet>
					)}
				</form.AppField>
			);
		case "Password":
			return (
				<form.AppField name={formElement.name}>
					{(field) => (
						<field.FieldSet className="w-full">
							<field.FieldLabel htmlFor={formElement.name}>
								{formElement.label}{" "}
								{formElement.required && (
									<span className="text-red-500">*</span>
								)}
							</field.FieldLabel>
							<field.Field orientation="horizontal">
								<field.InputGroup>
									<field.InputGroupInput
										id={formElement.name}
										placeholder={formElement.placeholder}
										disabled={formElement.disabled}
										type={"password"}
										name={formElement.name}
										value={(field.state.value as string | undefined) ?? ""}
										onChange={(e) => field.handleChange(e.target.value)}
										onBlur={field.handleBlur}
										aria-invalid={
											!!field.state.meta.errors.length &&
											field.state.meta.isTouched
										}
									/>
									<field.InputGroupAddon align="inline-end">
										<button
											type="button"
											className="cursor-pointer flex items-center justify-center p-1 hover:text-gray-100 rounded transition-colors"
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
								{formElement.description}
							</field.FieldDescription>
							<field.FieldError />
						</field.FieldSet>
					)}
				</form.AppField>
			);
		case "OTP":
			return (
				<form.AppField name={formElement.name}>
					{(field) => (
						<field.FieldSet className="w-full">
							<field.Field>
								<field.FieldLabel htmlFor={formElement.name}>
									{formElement.label}{" "}
									{formElement.required && (
										<span className="text-red-500">*</span>
									)}
								</field.FieldLabel>
								<InputOTP
									maxLength={formElement.maxLength ?? 6}
									name={formElement.name}
									value={(field.state.value as string | undefined) ?? ""}
									onChange={field.handleChange}
									required={formElement.required}
									disabled={formElement.disabled}
									aria-invalid={
										!!field.state.meta.errors.length &&
										field.state.meta.isTouched
									}
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
								{formElement.description}
							</field.FieldDescription>
							<field.FieldError />
						</field.FieldSet>
					)}
				</form.AppField>
			);
		case "Textarea":
			return (
				<form.AppField name={formElement.name}>
					{(field) => (
						<field.FieldSet className="w-full">
							<field.Field>
								<field.FieldLabel htmlFor={formElement.name}>
									{formElement.label}{" "}
									{formElement.required && (
										<span className="text-red-500">*</span>
									)}
								</field.FieldLabel>
								<Textarea
									placeholder={formElement.placeholder}
									required={formElement.required}
									disabled={formElement.disabled}
									value={(field.state.value as string | undefined) ?? ""}
									name={formElement.name}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
									className="resize-none"
									aria-invalid={
										!!field.state.meta.errors.length &&
										field.state.meta.isTouched
									}
								/>
								<field.FieldDescription>
									{formElement.description}
								</field.FieldDescription>
							</field.Field>
							<field.FieldError />
						</field.FieldSet>
					)}
				</form.AppField>
			);
		case "Checkbox":
			return (
				<form.AppField name={formElement.name}>
					{(field) => (
						<field.FieldSet>
							<field.Field orientation="horizontal">
								<Checkbox
									checked={Boolean(field.state.value)}
									onCheckedChange={field.handleChange}
									disabled={formElement.disabled}
									aria-invalid={
										!!field.state.meta.errors.length &&
										field.state.meta.isTouched
									}
								/>
								<field.FieldContent>
									<field.FieldLabel
										className="space-y-1 leading-none"
										htmlFor={formElement.name}
									>
										{formElement.label}{" "}
										{formElement.required && (
											<span className="text-red-500">*</span>
										)}
									</field.FieldLabel>
									{formElement.description ? (
										<field.FieldDescription>
											{formElement.description}
										</field.FieldDescription>
									) : null}
									<field.FieldError />
								</field.FieldContent>
							</field.Field>
						</field.FieldSet>
					)}
				</form.AppField>
			);
		case "RadioGroup":
			return (
				<form.AppField name={formElement.name}>
					{(field) => (
						<field.FieldSet className="flex flex-col gap-2 w-full py-1">
							<field.FieldLabel className="mt-0" htmlFor={formElement.name}>
								{formElement?.label}{" "}
								{formElement.required && (
									<span className="text-red-500">*</span>
								)}
							</field.FieldLabel>
							{formElement.description && (
								<field.FieldDescription>
									{formElement.description}
								</field.FieldDescription>
							)}
							<field.Field>
								<RadioGroup
									onValueChange={field.handleChange}
									name={formElement.name}
									value={(field.state.value as string | undefined) ?? ""}
									disabled={formElement.disabled}
									aria-invalid={
										!!field.state.meta.errors.length &&
										field.state.meta.isTouched
									}
								>
									{formElement.options.map(({ label, value }) => (
										<div key={value} className="flex items-center gap-x-2">
											<RadioGroupItem
												value={value}
												id={value}
												required={formElement.required}
											/>
											<Label htmlFor={value}>{label}</Label>
										</div>
									))}
								</RadioGroup>
							</field.Field>
							<field.FieldError />
						</field.FieldSet>
					)}
				</form.AppField>
			);
		case "ToggleGroup": {
			const options = formElement.options.map(({ label, value }) => (
				<ToggleGroupItem
					name={formElement.name}
					value={value}
					key={value}
					disabled={formElement.disabled}
					className="flex items-center gap-x-2 px-1"
				>
					{label}
				</ToggleGroupItem>
			));
			return (
				<form.AppField name={formElement.name}>
					{(field) => (
						<field.FieldSet className="flex flex-col gap-2 w-full py-1">
							<field.Field>
								<field.FieldLabel className="mt-0" htmlFor={formElement.name}>
									{formElement?.label}{" "}
									{formElement.required && (
										<span className="text-red-500">*</span>
									)}
								</field.FieldLabel>
								{formElement.type === "single" ? (
									<ToggleGroup
										type="single"
										variant="outline"
										onValueChange={field.handleChange}
										defaultValue={formElement.defaultValue || ""}
										className="flex justify-start items-center w-full"
										aria-invalid={
											!!field.state.meta.errors.length &&
											field.state.meta.isTouched
										}
									>
										{options}
									</ToggleGroup>
								) : (
									<ToggleGroup
										type="multiple"
										variant="outline"
										onValueChange={field.handleChange}
										defaultValue={
											Array.isArray(formElement.defaultValue)
												? formElement.defaultValue.filter(
														(val) => val !== undefined,
													)
												: formElement.defaultValue
													? [formElement.defaultValue]
													: []
										}
										className="flex justify-start items-center w-full"
										aria-invalid={
											!!field.state.meta.errors.length &&
											field.state.meta.isTouched
										}
									>
										{options}
									</ToggleGroup>
								)}
							</field.Field>
							{formElement.description && (
								<field.FieldDescription>
									{formElement.description}
								</field.FieldDescription>
							)}
							<field.FieldError />
						</field.FieldSet>
					)}
				</form.AppField>
			);
		}
		case "Switch":
			return (
				<form.AppField name={formElement.name}>
					{(field) => (
						<field.FieldSet className="flex flex-col p-3 justify-center w-full border rounded">
							<field.Field orientation="horizontal">
								<field.FieldContent>
									<field.FieldLabel htmlFor={formElement.name}>
										{formElement.label}
									</field.FieldLabel>
									{formElement.description && (
										<field.FieldDescription>
											{formElement.description}
										</field.FieldDescription>
									)}
								</field.FieldContent>
								<Switch
									name={formElement.name}
									checked={Boolean(field.state.value)}
									onCheckedChange={(checked) => {
										field.handleChange(checked);
										// Trigger validation by simulating blur
										field.handleBlur();
									}}
									disabled={formElement.disabled}
									aria-invalid={
										!!field.state.meta.errors.length &&
										field.state.meta.isTouched
									}
								/>
							</field.Field>
						</field.FieldSet>
					)}
				</form.AppField>
			);
		case "Slider":
			return (
				<form.AppField name={formElement.name}>
					{(field) => {
						const min = formElement.min || 0;
						const max = formElement.max || 100;
						const step = formElement.step || 1;
						const defaultSliderValue = formElement.defaultValue || min;
						const currentValue = field.state.value;
						const sliderValue = Array.isArray(currentValue)
							? currentValue
							: [currentValue || defaultSliderValue];

						return (
							<field.FieldSet className="w-full">
								<field.Field>
									<field.FieldLabel
										className="flex justify-between items-center"
										htmlFor={formElement.name}
									>
										{formElement.label}{" "}
										{formElement.required ? (
											<span className="text-red-500">*</span>
										) : (
											""
										)}
										<span className="text-sm text-muted-foreground">
											{sliderValue[0] || min} / {max}
										</span>
									</field.FieldLabel>
									<Slider
										name={formElement.name}
										min={min}
										max={max}
										disabled={formElement.disabled}
										step={step}
										value={sliderValue}
										aria-invalid={
											!!field.state.meta.errors.length &&
											field.state.meta.isTouched
										}
										onValueChange={(newValue) => {
											field.handleChange(newValue[0]);
											// Trigger validation by simulating blur
											field.handleBlur();
										}}
									/>
								</field.Field>
								<field.FieldDescription className="py-1">
									{formElement.description}
								</field.FieldDescription>
								<field.FieldError />
							</field.FieldSet>
						);
					}}
				</form.AppField>
			);
		case "Select":
			return (
				<form.AppField name={formElement.name}>
					{(field) => (
						<field.FieldSet className="w-full">
							<field.Field>
								<field.FieldLabel
									className="flex justify-between items-center"
									htmlFor={formElement.name}
								>
									{formElement.label}{" "}
									{formElement.required && (
										<span className="text-red-500">*</span>
									)}
								</field.FieldLabel>
							</field.Field>
							<Select
								name={formElement.name}
								value={(field.state.value as string | undefined) ?? ""}
								onValueChange={field.handleChange}
								defaultValue={String(field?.state.value ?? "")}
								disabled={formElement.disabled}
								aria-invalid={
									!!field.state.meta.errors.length && field.state.meta.isTouched
								}
							>
								<field.Field>
									<SelectTrigger className="w-full">
										<SelectValue
											placeholder={formElement.placeholder || "Select item"}
										/>
									</SelectTrigger>
								</field.Field>
								<SelectContent>
									{formElement.options.map(({ label, value }) => (
										<SelectItem key={value} value={value}>
											{label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<field.FieldDescription>
								{formElement.description}
							</field.FieldDescription>
							<field.FieldError />
						</field.FieldSet>
					)}
				</form.AppField>
			);
		case "MultiSelect":
			return (
				<form.AppField name={formElement.name}>
					{(field) => (
						<>
							<field.FieldSet className="w-full">
								<field.Field>
									<field.FieldLabel htmlFor={formElement.name}>
										{formElement.label}{" "}
										{formElement.required ? (
											<span className="text-red-500">*</span>
										) : (
											""
										)}
									</field.FieldLabel>
									<MultiSelect
										// value={field.state.value as string[]}
										disabled={formElement.disabled}
										onValueChange={field.handleChange}
										aria-invalid={
											!!field.state.meta.errors.length &&
											field.state.meta.isTouched
										}
									>
										<MultiSelectTrigger
											aria-invalid={
												!!field.state.meta.errors.length &&
												field.state.meta.isTouched
											}
										>
											<MultiSelectValue
												placeholder={formElement.placeholder || "Select item"}
											/>
										</MultiSelectTrigger>
										<MultiSelectContent>
											<MultiSelectList>
												{formElement.options.map(({ label, value }) => (
													<MultiSelectItem key={value} value={value}>
														{label}
													</MultiSelectItem>
												))}
											</MultiSelectList>
										</MultiSelectContent>
									</MultiSelect>
									<field.FieldDescription>
										{formElement.description}
									</field.FieldDescription>
									<field.FieldError />
								</field.Field>
							</field.FieldSet>
						</>
					)}
				</form.AppField>
			);
		case "DatePicker":
			return (
				<form.AppField name={formElement.name}>
					{(field) => {
						const date = field.state.value;
						return (
							<field.FieldSet className="flex flex-col w-full">
								<field.Field>
									<field.FieldLabel htmlFor={formElement.name}>
										{formElement.label}{" "}
										{formElement.required ? (
											<span className="text-red-500">*</span>
										) : (
											""
										)}
									</field.FieldLabel>
									<Popover>
										<PopoverTrigger
											asChild
											disabled={formElement.disabled}
											aria-invalid={
												!!field.state.meta.errors.length &&
												field.state.meta.isTouched
											}
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
													format(date as Date, "PPP")
												) : (
													<span>Pick a date</span>
												)}
											</Button>
										</PopoverTrigger>
										<PopoverContent className="w-auto p-0" align="start">
											<Calendar
												mode="single"
												selected={field.state.value as Date | undefined}
												onSelect={(newDate) => {
													field.handleChange(newDate?.toISOString());
												}}
												aria-invalid={
													!!field.state.meta.errors.length &&
													field.state.meta.isTouched
												}
											/>
										</PopoverContent>
									</Popover>
									<field.FieldDescription>
										{formElement.description}
									</field.FieldDescription>
									<field.FieldError />
								</field.Field>
							</field.FieldSet>
						);
					}}
				</form.AppField>
			);
		case "H1":
			return (
				<h1
					key={formElement.content}
					className={cn("mt-6 font-bold text-3xl", formElement.className)}
				>
					{formElement.content}
				</h1>
			);
		case "H2":
			return <h2 className="mt-4 font-bold text-xl">{formElement.content}</h2>;
		case "H3":
			return (
				<h3 className="mt-3 font-semiboldbold text-lg">
					{formElement.content} content
				</h3>
			);
		case "Separator":
			return <FieldSeparator />;
		case "FieldDescription":
			return <FieldDescription>{formElement.content}</FieldDescription>;
		case "FieldLegend":
			return <FieldLegend>{formElement.content}</FieldLegend>;
		default:
			return <div>Invalid Form Element</div>;
	}
};
