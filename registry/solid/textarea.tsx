import { cx } from "class-variance-authority";
import { splitProps, type ComponentProps, type ValidComponent } from "solid-js";

export type TextareaProps<T extends ValidComponent = "textarea"> =
	ComponentProps<T>;

export const Textarea = <T extends ValidComponent = "textarea">(
	props: TextareaProps<T>,
) => {
	const [, rest] = splitProps(props as ComponentProps<"textarea">, ["class"]);

	return (
		<textarea
			data-slot="textarea"
			class={cx(
				"placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex min-h-16 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
				"focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
				"aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
				props.class,
			)}
			{...rest}
		/>
	);
};
