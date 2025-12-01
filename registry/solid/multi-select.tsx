import { Popover as PopoverPrimitive } from "@kobalte/core/popover";
import { Check, ChevronUp, X } from "lucide-solid";
import type { ComponentProps, JSX, ValidComponent } from "solid-js";
import {
	createContext,
	createEffect,
	createMemo,
	createSignal,
	For,
	Show,
	splitProps,
	useContext,
} from "solid-js";
import { Badge } from "@/components/ui/badge";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	type CommandItemProps,
	CommandList,
	CommandSeparator,
} from "@/components/ui/command";
import {
	Popover,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cx } from "@/utils/utils";

export interface MultiSelectOptionItem {
	value: string;
	label?: JSX.Element;
}

interface MultiSelectContextValue {
	value: () => string[];
	open: () => boolean;
	onSelect(value: string, item: MultiSelectOptionItem): void;
	onDeselect(value: string, item: MultiSelectOptionItem): void;
	onSearch?: (keyword: string | undefined) => void;
	filter?: boolean | ((keyword: string, current: string) => boolean);
	disabled?: boolean;
	maxCount?: number;
	itemCache: Map<string, MultiSelectOptionItem>;
}

const MultiSelectContext = createContext<MultiSelectContextValue>();

const useMultiSelect = () => {
	const context = useContext(MultiSelectContext);
	if (!context) {
		throw new Error("useMultiSelect must be used within MultiSelect");
	}
	return context;
};

type MultiSelectProps = ComponentProps<typeof Popover> & {
	value?: string[];
	onValueChange?: (value: string[], items: MultiSelectOptionItem[]) => void;
	onSelect?: (value: string, item: MultiSelectOptionItem) => void;
	onDeselect?: (value: string, item: MultiSelectOptionItem) => void;
	defaultValue?: string[];
	onSearch?: (keyword: string | undefined) => void;
	filter?: boolean | ((keyword: string, current: string) => boolean);
	disabled?: boolean;
	maxCount?: number;
	children?: JSX.Element;
};

export const MultiSelect = (props: MultiSelectProps) => {
	const [local, rest] = splitProps(props, [
		"value",
		"onValueChange",
		"onDeselect",
		"onSelect",
		"defaultValue",
		"open",
		"onOpenChange",
		"defaultOpen",
		"onSearch",
		"filter",
		"disabled",
		"maxCount",
		"children",
	]);

	const itemCache = new Map<string, MultiSelectOptionItem>();

	const [internalValue, setInternalValue] = createSignal<string[]>(
		local.defaultValue || [],
	);
	const [internalOpen, setInternalOpen] = createSignal(
		local.defaultOpen || false,
	);

	const value = createMemo(() => local.value ?? internalValue());
	const open = createMemo(() => local.open ?? internalOpen());

	const handleValueChange = (newValue: string[]) => {
		setInternalValue(newValue);
		if (local.onValueChange) {
			const items = newValue
				.map((v) => itemCache.get(v))
				.filter((item): item is MultiSelectOptionItem => item !== undefined);
			local.onValueChange(newValue, items);
		}
	};

	const handleOpenChange = (isOpen: boolean) => {
		setInternalOpen(isOpen);
		local.onOpenChange?.(isOpen);
	};

	const handleSelect = (valueToSelect: string, item: MultiSelectOptionItem) => {
		const current = value();
		if (current.includes(valueToSelect)) {
			return;
		}
		local.onSelect?.(valueToSelect, item);
		handleValueChange([...current, valueToSelect]);
	};

	const handleDeselect = (
		valueToDeselect: string,
		item: MultiSelectOptionItem,
	) => {
		const current = value();
		if (!current.includes(valueToDeselect)) {
			return;
		}
		local.onDeselect?.(valueToDeselect, item);
		handleValueChange(current.filter((v) => v !== valueToDeselect));
	};

	const contextValue: MultiSelectContextValue = {
		value,
		open,
		onSearch: local.onSearch,
		filter: local.filter,
		disabled: local.disabled,
		maxCount: local.maxCount,
		onSelect: handleSelect,
		onDeselect: handleDeselect,
		itemCache,
	};

	return (
		<MultiSelectContext.Provider value={contextValue}>
			<Popover
				open={open()}
				onOpenChange={handleOpenChange}
				{...rest}
			>
				{local.children}
			</Popover>
		</MultiSelectContext.Provider>
	);
};

type MultiSelectTriggerProps<T extends ValidComponent = "div"> = ComponentProps<T>;

const preventClick = (e: MouseEvent | TouchEvent) => {
	e.preventDefault();
	e.stopPropagation();
};

export const MultiSelectTrigger = <T extends ValidComponent = "div">(
	props: MultiSelectTriggerProps<T>,
) => {
	const [, rest] = splitProps(props, [
		"class",
		"children",
	] as const);
	const { disabled } = useMultiSelect();

	return (
		<PopoverTrigger
			as={(triggerProps: Record<string, unknown>) => (
				<button
					type="button"
					aria-disabled={disabled}
					data-disabled={disabled}
					class={cx(
						"flex min-h-10 size-full items-center justify-between whitespace-nowrap rounded-sm border border-input border-dashed bg-transparent px-3 py-2 shadow-xs ring-offset-background focus:outline-hidden focus:ring-1 focus:ring-ring [&>span]:line-clamp-1 text-base",
						disabled ? "cursor-not-allowed opacity-50" : "cursor-text",
						props.class,
					)}
					onClick={disabled ? preventClick : undefined}
					onTouchStart={disabled ? preventClick : undefined}
					onKeyDown={
						disabled
							? (e) => {
									e.preventDefault();
									e.stopPropagation();
								}
							: undefined
					}
					tabIndex={disabled ? -1 : 0}
					disabled={disabled}
					{...triggerProps}
					{...rest}
				>
					{props.children}
					<ChevronUp class="size-4 opacity-50" />
				</button>
			)}
		/>
	);
};

type MultiSelectValueProps<T extends ValidComponent = "div"> = ComponentProps<T> & {
	placeholder?: string;
	maxDisplay?: number;
	maxItemLength?: number;
};

export const MultiSelectValue = <T extends ValidComponent = "div">(
	props: MultiSelectValueProps<T>,
) => {
	const [, rest] = splitProps(props as MultiSelectValueProps, [
		"class",
		"placeholder",
		"maxDisplay",
		"maxItemLength",
		"children",
	] as const);
	const { value, itemCache, onDeselect } = useMultiSelect();

	const renderRemain = createMemo(() => {
		const val = value();
		return props.maxDisplay && val.length > props.maxDisplay
			? val.length - props.maxDisplay
			: 0;
	});

	const renderItems = createMemo(() => {
		const val = value();
		const remain = renderRemain();
		return remain ? val.slice(0, props.maxDisplay) : val;
	});

	return (
		<Show
			when={value().length > 0}
			fallback={
				<span class="pointer-events-none text-muted-foreground">
					{props.placeholder}
				</span>
			}
		>
			<TooltipProvider delayDuration={300}>
				<div
					class={cx(
						"flex flex-1 overflow-x-hidden flex-wrap items-center gap-1.5",
						props.class,
					)}
					{...rest}
				>
					<For each={renderItems()}>
						{(val) => {
							const item = itemCache.get(val);
							const content = item?.label || val;
							const contentStr =
								typeof content === "string" ? content : String(content);
							const child =
								props.maxItemLength &&
								contentStr.length > props.maxItemLength
									? `${contentStr.slice(0, props.maxItemLength)}...`
									: content;

							const badge = (
								<Badge
									variant="outline"
									class="pr-1.5 group/multi-select-badge cursor-pointer rounded-full py-0.5"
									onClick={(e) => {
										e.preventDefault();
										e.stopPropagation();
										if (item) {
											onDeselect(val, item);
										}
									}}
								>
									<span>{child}</span>
									<X class="size-3 ml-1.5 text-muted-foreground group-hover/multi-select-badge:text-foreground" />
								</Badge>
							);

							return (
								<Show
									when={contentStr !== String(child)}
									fallback={badge}
								>
									<Tooltip>
										<TooltipTrigger class="inline-flex">{badge}</TooltipTrigger>
										<TooltipContent class="z-51">
											{contentStr}
										</TooltipContent>
									</Tooltip>
								</Show>
							);
						}}
					</For>
					<Show when={renderRemain() > 0}>
						<span class="text-muted-foreground text-xs leading-4 py-.5">
							+{renderRemain()}
						</span>
					</Show>
				</div>
			</TooltipProvider>
		</Show>
	);
};

export const MultiSelectSearch = <T extends ValidComponent = "input">(
	props: ComponentProps<T>,
) => {
	const [, rest] = splitProps(props, [
		"class",
		"onInput",
	] as const);
	const { onSearch } = useMultiSelect();

	return (
		<CommandInput
			{...rest}
			class={props.class}
			onValueChange={onSearch}
		/>
	);
};

export const MultiSelectList = <T extends ValidComponent = "div">(
	props: ComponentProps<T>,
) => {
	const [, rest] = splitProps(props, ["class"] as const);

	return (
		<CommandList
			class={cx("py-1 px-0 max-h-[unset]", props.class)}
			{...rest}
		/>
	);
};

type MultiSelectContentProps<T extends ValidComponent = "div"> = ComponentProps<T>;

export const MultiSelectContent = <T extends ValidComponent = "div">(
	props: MultiSelectContentProps<T>,
) => {
	const [local, rest] = splitProps(props as MultiSelectContentProps, [
		"class",
		"children",
	] as const);
	const context = useMultiSelect();

	return (
		<PopoverPrimitive.Portal>
			<PopoverPrimitive.Content
				data-slot="popover-content"
				align="start"
				sideOffset={4}
				onOpenAutoFocus={(e: Event) => {
					// Prevent auto-focus on open
					e.preventDefault();
				}}
				onCloseAutoFocus={(e: Event) => {
					// Prevent auto-focus when closing
					e.preventDefault();
				}}
				onFocusOutside={(e: Event) => {
					// ALWAYS prevent focus outside from closing
					// This is the key - focus changing shouldn't close the popover
					e.preventDefault();
				}}
				class={cx(
					"z-50 w-full rounded-sm border border-dashed bg-popover p-0 text-popover-foreground shadow-md outline-hidden data-expanded:animate-in data-closed:animate-out data-closed:fade-out-0 data-expanded:fade-in-0 data-closed:zoom-out-95 data-expanded:zoom-in-95",
					local.class,
				)}
				{...rest}
			>
				<Command
					class={cx("px-1 max-h-96 w-full")}
					shouldFilter={!context.onSearch}
				>
					{local.children}
				</Command>
			</PopoverPrimitive.Content>
		</PopoverPrimitive.Portal>
	);
};

type MultiSelectItemProps<T extends ValidComponent = "div"> = ComponentProps<T> &
	Partial<MultiSelectOptionItem> & {
		onSelect?: (value: string, item: MultiSelectOptionItem) => void;
		onDeselect?: (value: string, item: MultiSelectOptionItem) => void;
		disabled?: boolean;
	};

export const MultiSelectItem = <T extends ValidComponent = "div">(
	props: MultiSelectItemProps<T>,
) => {
	const [local] = splitProps(props as MultiSelectItemProps, [
		"class",
		"value",
		"onSelect",
		"onDeselect",
		"children",
		"label",
		"disabled",
	] as const);

	const {
		value: contextValue,
		maxCount,
		onSelect: contextOnSelect,
		onDeselect: contextOnDeselect,
		itemCache,
	} = useMultiSelect();

	const item = createMemo(() => {
		if (!local.value) return undefined;
		return {
			value: local.value,
			label: local.label || (typeof local.children === "string" ? local.children : undefined),
		};
	});

	const selected = createMemo(() => {
		const val = local.value;
		return val ? contextValue().includes(val) : false;
	});

	createEffect(() => {
		const val = local.value;
		const itm = item();
		if (val && itm) {
			itemCache.set(val, itm);
		}
	});

	const disabled = createMemo(() => {
		return (
			local.disabled ||
			(!selected() && !!maxCount && contextValue().length >= maxCount)
		);
	});

	const handleClick: (e?: MouseEvent) => void = (e?: MouseEvent) => {
		if (disabled() || !local.value) return;
		const itm = item();
		if (!itm) return;

		// Prevent event from bubbling up to close the popover
		if (e) {
			e.preventDefault();
			e.stopPropagation();
		}

		if (selected()) {
			local.onDeselect?.(local.value, itm);
			contextOnDeselect(local.value, itm);
		} else {
			itemCache.set(local.value, itm);
			local.onSelect?.(local.value, itm);
			contextOnSelect(local.value, itm);
		}
	};

	return (
		<CommandItem
			value={local.value}
			class={cx(
				disabled() && "text-muted-foreground cursor-not-allowed",
				local.class,
			)}
			disabled={disabled()}
			onSelect={handleClick as CommandItemProps["onSelect"]}
		>
			<span class="mr-2 whitespace-nowrap overflow-hidden text-ellipsis">
				{local.children || local.label || local.value}
			</span>
			<Show when={selected()}>
				<Check class="h-4 w-4 ml-auto shrink-0" />
			</Show>
		</CommandItem>
	);
};

export const MultiSelectGroup = <T extends ValidComponent = "div">(
	props: ComponentProps<typeof CommandGroup<T>>,
) => {
	return <CommandGroup {...props} />;
};

export const MultiSelectSeparator = <T extends ValidComponent = "div">(
	props: ComponentProps<T>,
) => {
	return <CommandSeparator {...props} />;
};

export const MultiSelectEmpty = <T extends ValidComponent = "div">(
	props: ComponentProps<T> & { children?: JSX.Element },
) => {
	return (
		<CommandEmpty {...props}>
			{props.children || "No Content"}
		</CommandEmpty>
	);
};

export interface MultiSelectOptionSeparator {
	type: "separator";
}

export interface MultiSelectOptionGroup {
	heading?: JSX.Element;
	value?: string;
	children: MultiSelectOption[];
}

export type MultiSelectOption =
	| Pick<
			MultiSelectItemProps<"div">,
			"value" | "label" | "onSelect" | "onDeselect"
	  > & {
			disabled?: boolean;
	  }
	| MultiSelectOptionSeparator
	| MultiSelectOptionGroup;

export const renderMultiSelectOptions = (list: MultiSelectOption[]) => {
	return list.map((option) => {
		if ("type" in option) {
			if (option.type === "separator") {
				return <MultiSelectSeparator />;
			}
			return null;
		}

		if ("children" in option) {
			return (
				<MultiSelectGroup heading={option.heading}>
					{renderMultiSelectOptions(option.children)}
				</MultiSelectGroup>
			);
		}

		return (
			<MultiSelectItem {...option}>
				{option.label}
			</MultiSelectItem>
		);
	});
};

