import type { ComponentProps, JSX, ValidComponent } from "solid-js";
import { Show, splitProps } from "solid-js";

import { Input } from "@/components/ui/input";
import { cx } from "@/utils/utils";

export type CommandProps<T extends ValidComponent = "div"> = ComponentProps<T> & {
	shouldFilter?: boolean;
	children?: JSX.Element;
};

export const Command = <T extends ValidComponent = "div">(props: CommandProps<T>) => {
	const [, rest] = splitProps(props as CommandProps, [
		"class",
		"shouldFilter",
		"children",
	]);

	return (
		<div
			data-slot="command"
			class={cx(
				"flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground",
				props.class,
			)}
			{...rest}
		>
			{props.children}
		</div>
	);
};

export type CommandInputProps<T extends ValidComponent = "input"> = ComponentProps<T> & {
	onValueChange?: (value: string) => void;
};

export const CommandInput = <T extends ValidComponent = "input">(
	props: CommandInputProps<T>,
) => {
	const [, rest] = splitProps(props as CommandInputProps, [
		"class",
		"onValueChange",
	]);

	return (
		<div class="flex items-center border-b px-3" cmdk-input-wrapper="">
			<Input
				{...rest}
				class={cx("border-0 bg-transparent focus-visible:ring-0", props.class)}
				onInput={(e) => props.onValueChange?.(e.currentTarget.value)}
			/>
		</div>
	);
};

export type CommandListProps<T extends ValidComponent = "div"> = ComponentProps<T>;

export const CommandList = <T extends ValidComponent = "div">(
	props: CommandListProps<T>,
) => {
	const [, rest] = splitProps(props as CommandListProps, ["class"]);

	return (
		<div
			data-slot="command-list"
			class={cx(
				"max-h-[300px] overflow-y-auto overflow-x-hidden p-1",
				props.class,
			)}
			{...rest}
		>
			{props.children}
		</div>
	);
};

export type CommandEmptyProps<T extends ValidComponent = "div"> = ComponentProps<T>;

export const CommandEmpty = <T extends ValidComponent = "div">(
	props: CommandEmptyProps<T>,
) => {
	const [, rest] = splitProps(props as CommandEmptyProps, ["class", "children"]);

	return (
		<div
			data-slot="command-empty"
			class={cx("py-6 text-center text-sm", props.class)}
			{...rest}
		>
			{props.children || "No results found."}
		</div>
	);
};

export type CommandGroupProps<T extends ValidComponent = "div"> = ComponentProps<T> & {
	heading?: JSX.Element;
};

export const CommandGroup = <T extends ValidComponent = "div">(
	props: CommandGroupProps<T>,
) => {
	const [, rest] = splitProps(props as CommandGroupProps, [
		"class",
		"heading",
		"children",
	]);

	return (
		<div
			data-slot="command-group"
			class={cx("overflow-hidden p-1 text-foreground", props.class)}
			{...rest}
		>
			<Show when={props.heading}>
				<div class="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
					{props.heading}
				</div>
			</Show>
			<div>{props.children}</div>
		</div>
	);
};

export type CommandItemProps<T extends ValidComponent = "div"> = ComponentProps<T> & {
	value?: string;
	disabled?: boolean;
	onSelect?: (e?: MouseEvent) => void;
};

export const CommandItem = <T extends ValidComponent = "div">(
	props: CommandItemProps<T>,
) => {
	const [, rest] = splitProps(props as CommandItemProps, [
		"class",
		"value",
		"disabled",
		"onSelect",
		"children",
	]);

	const handleMouseDown = (e: MouseEvent) => {
		// Prevent default to stop focus from shifting
		// This prevents the popover from closing when selecting items
		e.preventDefault();
	};

	const handleClick = (e: MouseEvent) => {
		if (!props.disabled && props.onSelect) {
			e.preventDefault();
			e.stopPropagation();
			props.onSelect(e);
		}
	};

	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			if (!props.disabled && props.onSelect) {
				props.onSelect();
			}
		}
	};

	return (
		<div
			data-slot="command-item"
			role="option"
			aria-selected={props.disabled ? undefined : "false"}
			aria-disabled={props.disabled}
			data-disabled={props.disabled}
			data-value={props.value}
			class={cx(
				"relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
				"data-[disabled=false]:cursor-pointer data-[disabled=false]:hover:bg-accent data-[disabled=false]:hover:text-accent-foreground",
				"data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50",
				props.class,
			)}
			onMouseDown={handleMouseDown}
			onClick={handleClick}
			onKeyDown={handleKeyDown}
			tabIndex={-1}
			{...rest}
		>
			{props.children}
		</div>
	);
};

export type CommandSeparatorProps<T extends ValidComponent = "div"> = ComponentProps<T>;

export const CommandSeparator = <T extends ValidComponent = "div">(
	props: CommandSeparatorProps<T>,
) => {
	const [, rest] = splitProps(props as CommandSeparatorProps, ["class"]);

	return (
		<div
			data-slot="command-separator"
			class={cx("-mx-1 h-px bg-border", props.class)}
			{...rest}
		/>
	);
};

