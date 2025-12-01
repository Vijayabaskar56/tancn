import type { ComponentProps, ValidComponent } from "solid-js";
import { splitProps } from "solid-js";
import type { VariantProps } from "cva";

import { cva, cx } from "@/utils/utils";

function Empty<T extends ValidComponent = "div">(props: ComponentProps<T>) {
	const [, rest] = splitProps(props as ComponentProps<"div">, ["class"]);

	return (
		<div
			data-slot="empty"
			class={cx(
				"flex min-w-0 flex-1 flex-col items-center justify-center gap-6 rounded-lg border-dashed p-6 text-center text-balance md:p-12",
				props.class,
			)}
			{...(rest as any)}
		/>
	);
}

function EmptyHeader<T extends ValidComponent = "div">(
	props: ComponentProps<T>,
) {
	const [, rest] = splitProps(props as ComponentProps<"div">, ["class"]);

	return (
		<div
			data-slot="empty-header"
			class={cx(
				"flex max-w-sm flex-col items-center gap-2 text-center",
				props.class,
			)}
			{...(rest as any)}
		/>
	);
}

const emptyMediaVariants = cva({
	base: [
		"flex shrink-0 items-center justify-center mb-2 [&_svg]:pointer-events-none [&_svg]:shrink-0",
	],
	variants: {
		variant: {
			default: "bg-transparent",
			icon: "bg-muted text-foreground flex size-10 shrink-0 items-center justify-center rounded-lg [&_svg:not([class*='size-'])]:size-6",
		},
	},
	defaultVariants: {
		variant: "default",
	},
});

export type EmptyMediaProps<T extends ValidComponent = "div"> =
	ComponentProps<T> & VariantProps<typeof emptyMediaVariants>;

function EmptyMedia<T extends ValidComponent = "div">(
	props: EmptyMediaProps<T>,
) {
	const [, rest] = splitProps(props as EmptyMediaProps, ["class", "variant"]);

	return (
		<div
			data-slot="empty-icon"
			data-variant={props.variant ?? "default"}
			class={cx(emptyMediaVariants({ variant: props.variant }), props.class)}
			{...(rest as any)}
		/>
	);
}

function EmptyTitle<T extends ValidComponent = "div">(
	props: ComponentProps<T>,
) {
	const [, rest] = splitProps(props as ComponentProps<"div">, ["class"]);

	return (
		<div
			data-slot="empty-title"
			class={cx("text-lg font-medium tracking-tight", props.class)}
			{...(rest as any)}
		/>
	);
}

function EmptyDescription<T extends ValidComponent = "p">(
	props: ComponentProps<T>,
) {
	const [, rest] = splitProps(props as ComponentProps<"p">, ["class"]);

	return (
		<p
			data-slot="empty-description"
			class={cx(
				"text-muted-foreground [&>a:hover]:text-primary text-sm/relaxed [&>a]:underline [&>a]:underline-offset-4",
				props.class,
			)}
			{...(rest as any)}
		/>
	);
}

function EmptyContent<T extends ValidComponent = "div">(
	props: ComponentProps<T>,
) {
	const [, rest] = splitProps(props as ComponentProps<"div">, ["class"]);

	return (
		<div
			data-slot="empty-content"
			class={cx(
				"flex w-full max-w-sm min-w-0 flex-col items-center gap-4 text-sm text-balance",
				props.class,
			)}
			{...(rest as any)}
		/>
	);
}

export {
	Empty,
	EmptyHeader,
	EmptyTitle,
	EmptyDescription,
	EmptyContent,
	EmptyMedia,
};
