import type { ComponentProps, ValidComponent } from "solid-js";
import { createMemo, For, splitProps } from "solid-js";
import type { VariantProps } from "cva";

import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/seperator";
import { cva, cx } from "@/utils/utils";

function FieldSet<T extends ValidComponent = "fieldset">(
	props: ComponentProps<T>,
) {
	const [, rest] = splitProps(props as ComponentProps<"fieldset">, ["class"]);

	return (
		<fieldset
			data-slot="field-set"
			class={cx(
				"flex flex-col gap-6",
				"has-[>[data-slot=checkbox-group]]:gap-3 has-[>[data-slot=radio-group]]:gap-3",
				props.class,
			)}
			{...(rest as any)}
		/>
	);
}

export type FieldLegendProps<T extends ValidComponent = "legend"> =
	ComponentProps<T> & { variant?: "legend" | "label" };

function FieldLegend<T extends ValidComponent = "legend">(
	props: FieldLegendProps<T>,
) {
	const [, rest] = splitProps(props as FieldLegendProps, ["class", "variant"]);

	return (
		<legend
			data-slot="field-legend"
			data-variant={props.variant ?? "legend"}
			class={cx(
				"mb-3 font-medium",
				"data-[variant=legend]:text-base",
				"data-[variant=label]:text-sm",
				props.class,
			)}
			{...(rest as any)}
		/>
	);
}

function FieldGroup<T extends ValidComponent = "div">(
	props: ComponentProps<T>,
) {
	const [, rest] = splitProps(props as ComponentProps<"div">, ["class"]);

	return (
		<div
			data-slot="field-group"
			class={cx(
				"group/field-group @container/field-group flex w-full flex-col gap-7 data-[slot=checkbox-group]:gap-3 [&>[data-slot=field-group]]:gap-4",
				props.class,
			)}
			{...(rest as any)}
		/>
	);
}

export const fieldVariants = cva({
	base: ["group/field flex w-full gap-3 data-[invalid=true]:text-destructive"],
	variants: {
		orientation: {
			vertical: ["flex-col [&>*]:w-full [&>.sr-only]:w-auto"],
			horizontal: [
				"flex-row items-center",
				"[&>[data-slot=field-label]]:flex-auto",
				"has-[>[data-slot=field-content]]:items-start has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
			],
			responsive: [
				"flex-col [&>*]:w-full [&>.sr-only]:w-auto @md/field-group:flex-row @md/field-group:items-center @md/field-group:[&>*]:w-auto",
				"@md/field-group:[&>[data-slot=field-label]]:flex-auto",
				"@md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
			],
		},
	},
	defaultVariants: {
		orientation: "vertical",
	},
});

export type FieldProps<T extends ValidComponent = "div"> = ComponentProps<T> &
	VariantProps<typeof fieldVariants>;

function Field<T extends ValidComponent = "div">(props: FieldProps<T>) {
	const [, rest] = splitProps(props as FieldProps, ["class", "orientation"]);

	return (
		<div
			role="group"
			data-slot="field"
			data-orientation={props.orientation ?? "vertical"}
			class={cx(fieldVariants({ orientation: props.orientation }), props.class)}
			{...(rest as any)}
		/>
	);
}

function FieldContent<T extends ValidComponent = "div">(
	props: ComponentProps<T>,
) {
	const [, rest] = splitProps(props as ComponentProps<"div">, ["class"]);

	return (
		<div
			data-slot="field-content"
			class={cx(
				"group/field-content flex flex-1 flex-col gap-1.5 leading-snug",
				props.class,
			)}
			{...(rest as any)}
		/>
	);
}

function FieldLabel<T extends ValidComponent = "label">(
	props: ComponentProps<typeof Label<T>>,
) {
	const [, rest] = splitProps(props as ComponentProps<typeof Label>, ["class"]);

	return (
		<Label
			data-slot="field-label"
			class={cx(
				"group/field-label peer/field-label flex w-fit gap-2 leading-snug group-data-[disabled=true]/field:opacity-50",
				"has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col has-[>[data-slot=field]]:rounded-md has-[>[data-slot=field]]:border [&>*]:data-[slot=field]:p-4",
				"has-data-[state=checked]:bg-primary/5 has-data-[state=checked]:border-primary dark:has-data-[state=checked]:bg-primary/10",
				"group-data-[invalid=true]/field:text-destructive",
				props.class,
			)}
			{...(rest as any)}
		/>
	);
}

function FieldTitle<T extends ValidComponent = "div">(
	props: ComponentProps<T>,
) {
	const [, rest] = splitProps(props as ComponentProps<"div">, ["class"]);

	return (
		<div
			data-slot="field-label"
			class={cx(
				"flex w-fit items-center gap-2 text-sm leading-snug font-medium group-data-[disabled=true]/field:opacity-50",
				props.class,
			)}
			{...(rest as any)}
		/>
	);
}

function FieldDescription<T extends ValidComponent = "p">(
	props: ComponentProps<T>,
) {
	const [, rest] = splitProps(props as ComponentProps<"p">, ["class"]);

	return (
		<p
			data-slot="field-description"
			class={cx(
				"text-muted-foreground text-sm leading-normal font-normal group-has-[[data-orientation=horizontal]]/field:text-balance",
				"last:mt-0 nth-last-2:-mt-1 [[data-variant=legend]+&]:-mt-1.5",
				"[&>a:hover]:text-primary [&>a]:underline [&>a]:underline-offset-4",
				props.class,
			)}
			{...(rest as any)}
		/>
	);
}

function FieldSeparator<T extends ValidComponent = "div">(
	props: ComponentProps<T> & {
		children?: unknown;
	},
) {
	const [, rest] = splitProps(props as ComponentProps<"div">, [
		"class",
		"children",
	]);

	return (
		<div
			data-slot="field-separator"
			data-content={!!props.children}
			class={cx(
				"relative -my-2 h-5 text-sm group-data-[variant=outline]/field-group:-mb-2",
				props.class,
			)}
			{...(rest as any)}
		>
			<Separator class="absolute inset-0 top-1/2" />
			{props.children && (
				<span
					class="bg-background text-muted-foreground relative mx-auto block w-fit px-2"
					data-slot="field-separator-content"
				>
					{props.children}
				</span>
			)}
		</div>
	);
}

export type FieldErrorProps<T extends ValidComponent = "div"> =
	ComponentProps<T> & {
		errors?: Array<{ message?: string } | undefined>;
	};

function FieldError<T extends ValidComponent = "div">(
	props: FieldErrorProps<T>,
) {
	const [, rest] = splitProps(props as FieldErrorProps, [
		"class",
		"children",
		"errors",
	]);

	const content = createMemo(() => {
		if (props.children) {
			return props.children;
		}

		if (!props.errors) {
			return null;
		}

		if (props.errors?.length === 1 && props.errors[0]?.message) {
			return props.errors[0].message;
		}

		return (
			<ul class="ml-4 flex list-disc flex-col gap-1">
				<For each={props.errors}>
					{(error) => error?.message && <li>{error.message}</li>}
				</For>
			</ul>
		);
	});

	if (!content()) {
		return null;
	}

	return (
		<div
			role="alert"
			data-slot="field-error"
			class={cx("text-destructive text-sm font-normal", props.class)}
			{...(rest as any)}
		>
			{content()}
		</div>
	);
}

export {
	Field,
	FieldLabel,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLegend,
	FieldSeparator,
	FieldSet,
	FieldContent,
	FieldTitle,
};
