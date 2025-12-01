import { Popover as PopoverPrimitive } from "@kobalte/core/popover";
import type { ComponentProps, JSX, ValidComponent } from "solid-js";
import { splitProps } from "solid-js";

import { cx } from "@/utils/utils";

export type TooltipProps = ComponentProps<typeof PopoverPrimitive> & {
	delayDuration?: number;
};

export const Tooltip = (props: TooltipProps) => {
	const [, rest] = splitProps(props, ["delayDuration"]);
	return <PopoverPrimitive data-slot="tooltip" {...rest} />;
};

export type TooltipTriggerProps<T extends ValidComponent = "button"> =
	ComponentProps<typeof PopoverPrimitive.Trigger<T>>;

export const TooltipTrigger = <T extends ValidComponent = "button">(
	props: TooltipTriggerProps<T>,
) => {
	return <PopoverPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
};

export type TooltipContentProps<T extends ValidComponent = "div"> =
	ComponentProps<typeof PopoverPrimitive.Content<T>>;

export const TooltipContent = <T extends ValidComponent = "div">(
	props: TooltipContentProps<T>,
) => {
	const [, rest] = splitProps(props as TooltipContentProps, ["class"]);

	return (
		<PopoverPrimitive.Content
			data-slot="tooltip-content"
			class={cx(
				"z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[expanded]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[closed]:zoom-out-95",
				props.class,
			)}
			{...rest}
		/>
	);
};

export type TooltipProviderProps = {
	delayDuration?: number;
	children?: JSX.Element;
};

export const TooltipProvider = (props: TooltipProviderProps) => {
	return <>{props.children}</>;
};
