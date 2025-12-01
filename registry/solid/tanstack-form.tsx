import { createFormHook } from "@tanstack/solid-form";
import type { VariantProps } from "cva";
import type { ComponentProps, JSX, ValidComponent } from "solid-js";
import {
	createContext,
	createMemo,
	Show,
	splitProps,
	useContext,
} from "solid-js";

import { Button, type buttonVariants } from "@/components/ui/button";
import {
	Field as DefaultField,
	FieldError as DefaultFieldError,
	FieldSet as DefaultFieldSet,
	FieldContent,
	FieldDescription,
	FieldGroup,
	FieldLabel,
	FieldLegend,
	FieldSeparator,
	FieldTitle,
	type fieldVariants,
} from "@/components/ui/field";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import {
	_useFieldContext,
	fieldContext,
	formContext,
	useFormContext,
} from "@/components/ui/tanstack-form-contexts";
import { cx } from "@/utils/utils";

type FormItemContextValue = {
	id: string;
};

const FormItemContext = createContext<FormItemContextValue>();

function FieldSet<T extends ValidComponent = "fieldset">(
	props: ComponentProps<T> & { children?: JSX.Element },
) {
	const id = crypto.randomUUID();
	const [, rest] = splitProps(props as ComponentProps<"fieldset">, [
		"class",
		"children",
	]);

	return (
		<FormItemContext.Provider value={{ id }}>
			<DefaultFieldSet class={cx("grid gap-1", props.class)} {...rest}>
				{props.children}
			</DefaultFieldSet>
		</FormItemContext.Provider>
	);
}

const useFieldContext = () => {
	const formItemContext = useContext(FormItemContext);
	if (!formItemContext) {
		throw new Error("useFieldContext should be used within <FormItem>");
	}

	const { id } = formItemContext;
	const fieldAccessor = _useFieldContext();

	if (!fieldAccessor) {
		throw new Error("useFieldContext should be used within <FormItem>");
	}

	return {
		id,
		name: () => fieldAccessor().name,
		formItemId: `${id}-form-item`,
		formDescriptionId: `${id}-form-item-description`,
		formMessageId: `${id}-form-item-message`,
		errors: () => fieldAccessor().state.meta.errors,
		isTouched: () => fieldAccessor().state.meta.isTouched,
		store: () => fieldAccessor().store,
		field: fieldAccessor,
	};
};

export type FieldProps<T extends ValidComponent = "div"> = ComponentProps<T> &
	VariantProps<typeof fieldVariants> & { children?: JSX.Element };

function Field<T extends ValidComponent = "div">(props: FieldProps<T>) {
	const [, rest] = splitProps(props as FieldProps, [
		"class",
		"orientation",
		"children",
	]);

	const fieldContextValue = useFieldContext();
	const field = fieldContextValue.field();

	const hasVisibleErrors = createMemo(() => {
		const errors = fieldContextValue.errors();
		const isTouched = fieldContextValue.isTouched();
		return errors.length > 0 && isTouched;
	});

	return (
		<DefaultField
			data-invalid={hasVisibleErrors() ? "true" : undefined}
			id={fieldContextValue.formItemId}
			onBlur={field.handleBlur}
			aria-describedby={
				!hasVisibleErrors()
					? `${fieldContextValue.formDescriptionId}`
					: `${fieldContextValue.formDescriptionId} ${fieldContextValue.formMessageId}`
			}
			aria-invalid={hasVisibleErrors()}
			orientation={props.orientation}
			class={props.class}
			{...rest}
		>
			{props.children}
		</DefaultField>
	);
}

function FieldError<T extends ValidComponent = "p">(props: ComponentProps<T>) {
	const [, rest] = splitProps(props as ComponentProps<"p">, ["class"]);

	const fieldContextValue = useFieldContext();

	const errorMessage = createMemo(() => {
		const errors = fieldContextValue.errors();
		const isTouched = fieldContextValue.isTouched();
		if (errors.length === 0 || !isTouched) return null;
		return String(errors[0]?.message ?? "");
	});

	return (
		<Show when={errorMessage()}>
			{(msg) => (
				<DefaultFieldError
					data-slot="form-message"
					id={fieldContextValue.formMessageId}
					class={cx("text-destructive text-sm", props.class)}
					errors={[{ message: msg() }]}
					{...rest}
				/>
			)}
		</Show>
	);
}

function Form<T extends ValidComponent = "form">(
	props: Omit<ComponentProps<T>, "onSubmit" | "noValidate"> & {
		children?: JSX.Element;
	},
) {
	const [, rest] = splitProps(props as ComponentProps<"form">, [
		"class",
		"children",
	]);

	const form = useFormContext();

	const handleSubmit = (e: Event) => {
		e.preventDefault();
		e.stopPropagation();
		form.handleSubmit();
	};

	return (
		<form
			onSubmit={handleSubmit}
			class={cx("flex flex-col p-2 md:p-5 w-full mx-auto gap-2", props.class)}
			noValidate
			{...rest}
		>
			{props.children}
		</form>
	);
}

export type SubmitButtonProps<T extends ValidComponent = "button"> =
	ComponentProps<T> &
		VariantProps<typeof buttonVariants> & {
			label: string;
		};

function SubmitButton<T extends ValidComponent = "button">(
	props: SubmitButtonProps<T>,
) {
	const [, rest] = splitProps(props, ["class", "size", "label"]);

	const form = useFormContext();

	return (
		<form.Subscribe selector={(state) => state.isSubmitting}>
			{(isSubmitting) => (
				<Button
					class={props.class}
					size={props.size}
					type="submit"
					disabled={isSubmitting()}
					{...rest}
				>
					{isSubmitting() && <Spinner />}
					{props.label}
				</Button>
			)}
		</form.Subscribe>
	);
}

export type StepButtonProps<T extends ValidComponent = "button"> =
	ComponentProps<T> &
		VariantProps<typeof buttonVariants> & {
			label: JSX.Element | string;
			handleMovement: () => void;
		};

function StepButton<T extends ValidComponent = "button">(
	props: StepButtonProps<T>,
) {
	const [, rest] = splitProps(props, ["label", "handleMovement"]);

	return (
		<Button
			size="sm"
			variant="ghost"
			type="button"
			onClick={props.handleMovement}
			{...rest}
		>
			{props.label}
		</Button>
	);
}

const { useAppForm, withForm , withFieldGroup } = createFormHook({
	fieldContext,
	formContext,
	fieldComponents: {
		Field,
		FieldError,
		FieldSet,
		FieldContent,
		FieldDescription,
		FieldGroup,
		FieldLabel,
		FieldLegend,
		FieldSeparator,
		FieldTitle,
		InputGroup,
		InputGroupAddon,
		InputGroupInput,
	},
	formComponents: {
		SubmitButton,
		StepButton,
		FieldLegend,
		FieldDescription,
		FieldSeparator,
		Form,
	},
});

export { useAppForm, useFieldContext, useFormContext, withForm ,withFieldGroup};
