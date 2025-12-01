import { createFormHookContexts } from "@tanstack/solid-form";

export const {
	fieldContext,
	formContext,
	useFieldContext: _useFieldContext,
	useFormContext,
} = createFormHookContexts();
