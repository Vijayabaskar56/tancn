import type { ComponentProps, JSX, ValidComponent } from "solid-js";
import { splitProps } from "solid-js";
import type { VariantProps } from "cva";

import { Button } from "@/components/ui/button";
import { cva, cx } from "@/utils/utils";

function InputGroup<T extends ValidComponent = "div">(
	props: ComponentProps<T>,
) {
	const [, rest] = splitProps(props as ComponentProps<"div">, ["class"]);

	return (
		<div
			data-slot="input-group"
			role="group"
			class={cx(
				"group/input-group border-input dark:bg-input/30 relative flex w-full items-center rounded-md border shadow-xs transition-[color,box-shadow] outline-none",
				"h-9 has-[>textarea]:h-auto",

				// Variants based on alignment.
				"has-[>[data-align=inline-start]]:[&>input]:pl-2",
				"has-[>[data-align=inline-end]]:[&>input]:pr-2",
				"has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>[data-align=block-start]]:[&>input]:pb-3",
				"has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-end]]:[&>input]:pt-3",

				// Focus state.
				"has-[[data-slot=input-group-control]:focus-visible]:border-ring has-[[data-slot=input-group-control]:focus-visible]:ring-ring/50 has-[[data-slot=input-group-control]:focus-visible]:ring-[3px]",

				// Error state.
				"has-[[data-slot][aria-invalid=true]]:ring-destructive/20 has-[[data-slot][aria-invalid=true]]:border-destructive dark:has-[[data-slot][aria-invalid=true]]:ring-destructive/40",

				props.class,
			)}
			{...(rest as any)}
		/>
	);
}

const inputGroupAddonVariants = cva({
	base: [
		"text-muted-foreground flex h-auto cursor-text items-center justify-center gap-2 py-1.5 text-sm font-medium select-none [&>svg:not([class*='size-'])]:size-4 [&>kbd]:rounded-[calc(var(--radius)-5px)] group-data-[disabled=true]/input-group:opacity-50",
	],
	variants: {
		align: {
			"inline-start":
				"order-first pl-3 has-[>button]:ml-[-0.45rem] has-[>kbd]:ml-[-0.35rem]",
			"inline-end":
				"order-last pr-3 has-[>button]:mr-[-0.45rem] has-[>kbd]:mr-[-0.35rem]",
			"block-start":
				"order-first w-full justify-start px-3 pt-3 [.border-b]:pb-3 group-has-[>input]/input-group:pt-2.5",
			"block-end":
				"order-last w-full justify-start px-3 pb-3 [.border-t]:pt-3 group-has-[>input]/input-group:pb-2.5",
		},
	},
	defaultVariants: {
		align: "inline-start",
	},
});

export type InputGroupAddonProps<T extends ValidComponent = "div"> =
	ComponentProps<T> & VariantProps<typeof inputGroupAddonVariants>;

function InputGroupAddon<T extends ValidComponent = "div">(
	props: InputGroupAddonProps<T>,
) {
	const [, rest] = splitProps(props as InputGroupAddonProps, [
		"class",
		"align",
		"onClick",
	]);

	const handleClick: JSX.EventHandler<HTMLDivElement, MouseEvent> = (e) => {
		if ((e.target as HTMLElement).closest("button")) {
			return;
		}
		e.currentTarget.parentElement?.querySelector("input")?.focus();
	};

	return (
		<div
			role="group"
			data-slot="input-group-addon"
			data-align={props.align ?? "inline-start"}
			class={cx(inputGroupAddonVariants({ align: props.align }), props.class)}
			onClick={handleClick}
			{...(rest as any)}
		/>
	);
}

const inputGroupButtonVariants = cva({
	base: ["text-sm shadow-none flex gap-2 items-center"],
	variants: {
		size: {
			xs: "h-6 gap-1 px-2 rounded-[calc(var(--radius)-5px)] [&>svg:not([class*='size-'])]:size-3.5 has-[>svg]:px-2",
			sm: "h-8 px-2.5 gap-1.5 rounded-md has-[>svg]:px-2.5",
			"icon-xs": "size-6 rounded-[calc(var(--radius)-5px)] p-0 has-[>svg]:p-0",
			"icon-sm": "size-8 p-0 has-[>svg]:p-0",
		},
	},
	defaultVariants: {
		size: "xs",
	},
});

export type InputGroupButtonProps<T extends ValidComponent = "button"> = Omit<
	ComponentProps<typeof Button<T>>,
	"size"
> &
	VariantProps<typeof inputGroupButtonVariants>;

function InputGroupButton<T extends ValidComponent = "button">(
	props: InputGroupButtonProps<T>,
) {
	const [, rest] = splitProps(props as InputGroupButtonProps, [
		"class",
		"variant",
		"size",
		"type",
	]);

	return (
		<Button
			type={(props.type as any) ?? "button"}
			data-size={props.size ?? "xs"}
			variant={props.variant ?? "ghost"}
			class={cx(inputGroupButtonVariants({ size: props.size }), props.class)}
			{...(rest as any)}
		/>
	);
}

function InputGroupText<T extends ValidComponent = "span">(
	props: ComponentProps<T>,
) {
	const [, rest] = splitProps(props as ComponentProps<"span">, ["class"]);

	return (
		<span
			class={cx(
				"text-muted-foreground flex items-center gap-2 text-sm [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
				props.class,
			)}
			{...(rest as any)}
		/>
	);
}

function InputGroupInput<T extends ValidComponent = "input">(
	props: ComponentProps<T>,
) {
	const [, rest] = splitProps(props as ComponentProps<"input">, ["class"]);

	return (
		<input
			data-slot="input-group-control"
			class={cx(
				"placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full flex-1 rounded-none border-0 bg-transparent px-3 py-1 text-base shadow-none transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
				"focus-visible:ring-0 dark:bg-transparent",
				props.class,
			)}
			{...(rest as any)}
		/>
	);
}

function InputGroupTextarea<T extends ValidComponent = "textarea">(
	props: ComponentProps<T>,
) {
	const [, rest] = splitProps(props as ComponentProps<"textarea">, ["class"]);

	return (
		<textarea
			data-slot="input-group-control"
			class={cx(
				"placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex min-h-16 w-full flex-1 resize-none rounded-none border-0 bg-transparent px-3 py-3 text-base shadow-none transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
				"focus-visible:ring-0 dark:bg-transparent",
				props.class,
			)}
			{...(rest as any)}
		/>
	);
}

export {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupText,
	InputGroupInput,
	InputGroupTextarea,
};
