import { useStore } from "@tanstack/react-store";
import { useMemo } from "react";
import { toast } from "sonner";
import type * as v from "valibot";
import { revalidateLogic, useAppForm } from "@/components/ui/tanstack-form";
import { useFormStore, useIsMultiStep } from "@/hooks/use-form-store";
import { getDefaultFormElement } from "@/lib/form-code-generators/react/generate-default-value";
import { flattenFormSteps } from "@/lib/form-elements-helpers";
import { generateValiSchemaObject } from "@/lib/schema-generators/generate-valibot-schema";
import type { FormElement, FormStep } from "@/types/form-types";
import useSettings from "./use-settings";

interface DefaultValues {
	[key: string]: unknown;
}
export type AppForm = ReturnType<typeof useAppForm> & {
	baseStore: {
		state: {
			values: DefaultValues;
			isSubmitting: boolean;
			isSubmitted: boolean;
		};
	};
	handleSubmit: () => void;
	AppForm: React.ComponentType<React.PropsWithChildren>;
	AppField: React.ComponentType<{
		name: string;
		children: (field: {
			FormItem: React.ComponentType<React.PropsWithChildren>;
			FormLabel: React.ComponentType<React.PropsWithChildren>;
			FormControl: React.ComponentType<React.PropsWithChildren>;
			FormDescription: React.ComponentType<React.PropsWithChildren>;
			FormMessage: React.ComponentType<React.PropsWithChildren>;
			state: { value: unknown };
			handleChange: (value: unknown) => void;
			handleBlur: () => void;
		}) => React.ReactElement;
	}>;
	reset: () => void;
};

export const useFormBuilder = (): {
	form: AppForm;
	resetForm: () => void;
	isDefault: boolean;
} => {
	const isMS = useIsMultiStep();
	const { actions, formElements } = useFormStore();
	const settings = useSettings();
	const flattenFormElements = isMS
		? flattenFormSteps(formElements as FormStep[]).flat()
		: (formElements.flat() as FormElement[]);
	const filteredFormFields = flattenFormElements.filter((o) => o && !o.static);
	const valiSchema = useMemo(
		() => generateValiSchemaObject(filteredFormFields),
		[filteredFormFields],
	);

	const defaultValue = useMemo(
		() => getDefaultFormElement(filteredFormFields),
		[filteredFormFields],
	);
	const validators = useMemo(() => {
		const baseValidators: Record<string, unknown> = {};
		if (settings.validationMethod === "onDynamic") {
			baseValidators.onDynamic = valiSchema.objectSchema;
			baseValidators.onDynamicAsyncDebounceMs = settings.asyncValidation;
		} else if (settings.validationMethod === "onChange") {
			baseValidators.onChange = valiSchema.objectSchema;
			baseValidators.onChangeAsyncDebounceMs = settings.asyncValidation;
		} else if (settings.validationMethod === "onBlur") {
			baseValidators.onBlur = valiSchema.objectSchema;
			baseValidators.onBlurAsyncDebounceMs = settings.asyncValidation;
		} else {
			baseValidators.onDynamic = valiSchema.objectSchema;
			baseValidators.onDynamicAsyncDebounceMs = settings.asyncValidation;
		}
		return baseValidators;
	}, [
		settings.validationMethod,
		settings.asyncValidation,
		valiSchema.objectSchema,
	]);
	const form = useAppForm({
		defaultValues: defaultValue as v.InferInput<typeof valiSchema.objectSchema>,
		validationLogic:
			settings.validationMethod === "onDynamic"
				? revalidateLogic()
				: settings.validationMethod === "onChange"
					? revalidateLogic({ mode: "change", modeAfterSubmission: "change" })
					: settings.validationMethod === "onBlur"
						? revalidateLogic({ mode: "blur", modeAfterSubmission: "blur" })
						: revalidateLogic({ mode: "blur", modeAfterSubmission: "blur" }),
		validators: validators,
		onSubmit: async () => {
			try {
				// Simulate async submission
				await new Promise((resolve) => setTimeout(resolve, 1000));
				toast.success("Form submitted successfully!");
			} catch (_error) {
				toast.error("Failed to submit form. Please try again.");
			}
		},
		canSubmitWhenInvalid: true,
		onSubmitInvalid({ formApi }) {
			try {
				// This can be extracted to a function that takes the form ID and `formAPI` as arguments
				const errorMap =
					formApi.state.errorMap[settings.validationMethod || "onDynamic"];
				const inputs = Array.from(
					// Must match the selector used in your form
					document.querySelectorAll("#previewForm input"),
				) as HTMLInputElement[];

				let firstInput: HTMLInputElement | undefined;
				for (const input of inputs) {
					if (errorMap?.[input.name]) {
						firstInput = input;
						break;
					}
				}
				firstInput?.focus();
			} catch (_error) {}
		},
	});
	const { reset } = form;
	const isDefault = useStore(form.store, (state) => state.isDefaultValue);
	const resetForm = () => {
		actions.resetFormElements();
		reset();
	};
	return { form: form as unknown as AppForm, resetForm, isDefault };
};
