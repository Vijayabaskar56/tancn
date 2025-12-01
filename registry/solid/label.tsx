import type { ComponentProps, ValidComponent } from "solid-js";
import { splitProps } from "solid-js";

import { cx } from "@/utils/utils";

export type LabelProps<T extends ValidComponent = "label"> = ComponentProps<T>;

export const Label = <T extends ValidComponent = "label">(
	props: LabelProps<T>,
) => {
	const [, rest] = splitProps(props as LabelProps, ["class"]);

	return (
		<label
			data-slot="label"
			class={cx(
				"flex items-center gap-2 text-sm font-medium leading-none select-none",
				"group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50",
				"peer-disabled:pointer-events-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
				props.class,
			)}
			{...(rest as any)}
		/>
	);
};
