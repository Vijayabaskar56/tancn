import type { ComponentProps, ValidComponent } from "solid-js";
import { splitProps } from "solid-js";

import { cx } from "@/utils/utils";

export type SpinnerProps<T extends ValidComponent = "div"> = ComponentProps<T>;

export const Spinner = <T extends ValidComponent = "div">(
	props: SpinnerProps<T>,
) => {
	const [, rest] = splitProps(props as SpinnerProps, ["class"]);

	return (
		<div
			data-slot="spinner"
			class={cx(
				"inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent",
				props.class,
			)}
			{...(rest as any)}
		/>
	);
};
