import { cva, type VariantProps } from "cva";
import type { ComponentProps, ValidComponent } from "solid-js";
import { splitProps } from "solid-js";

import { cx } from "@/utils/utils";

export const badgeVariants = cva({
	base: [
		"inline-flex items-center justify-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
	],
	variants: {
		variant: {
			default:
				"border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
			secondary:
				"border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
			destructive:
				"border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
			outline: "text-foreground",
		},
	},
	defaultVariants: {
		variant: "default",
	},
});

export type BadgeProps<T extends ValidComponent = "div"> = ComponentProps<T> &
	VariantProps<typeof badgeVariants>;

export const Badge = <T extends ValidComponent = "div">(props: BadgeProps<T>) => {
	const [, rest] = splitProps(props as BadgeProps, ["class", "variant"]);

	return (
		<div
			data-slot="badge"
			class={cx(badgeVariants({ variant: props.variant }), props.class)}
			{...rest}
		/>
	);
};

