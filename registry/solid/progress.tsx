import type { ComponentProps, ValidComponent } from "solid-js";
import { splitProps } from "solid-js";
import { Progress } from "@kobalte/core/progress";

import { cx } from "@/utils/utils";

export type ProgressProps<T extends ValidComponent = "div"> = ComponentProps<
	typeof Progress<T>
>;

export const ProgressComponent = <T extends ValidComponent = "div">(
	props: ProgressProps<T>,
) => {
	const [, rest] = splitProps(props as ProgressProps, ["class", "value"]);

	return (
		<Progress
			data-slot="progress"
			class={cx(
				"bg-primary/20 relative h-2 w-full overflow-hidden rounded-full",
				props.class,
			)}
			value={props.value}
			{...rest}
		>
			<Progress.Fill
				data-slot="progress-indicator"
				class="bg-primary h-full w-full flex-1 transition-all"
				style={{
					width: "var(--kb-progress-fill-width)",
				}}
			/>
		</Progress>
	);
};

export { ProgressComponent as Progress };
