import { useLiveQuery } from "@tanstack/react-db";
import { createIsomorphicFn } from "@tanstack/react-start";
import {
	type FormBuilderSettings,
	formBuilderCollection,
} from "@/db-collections/form-builder.collections";

// Re-export types for backwards compatibility
export type SettingsCollection = FormBuilderSettings & { id?: string };

const defaultSettings: FormBuilderSettings = {
	activeTab: "builder",
	defaultRequiredValidation: true,
	numericInput: false,
	focusOnError: true,
	validationMethod: "onDynamic",
	asyncValidation: 300,
	preferredSchema: "zod",
	preferredFramework: "react",
	preferredPackageManager: "pnpm",
	isCodeSidebarOpen: false,
};

const useSettings = createIsomorphicFn()
	.server((): FormBuilderSettings => {
		return defaultSettings;
	})
	.client((): FormBuilderSettings => {
		const { data } = useLiveQuery((q) =>
			q.from({ form: formBuilderCollection }).select(({ form }) => ({
				activeTab: form.settings.activeTab,
				defaultRequiredValidation: form.settings.defaultRequiredValidation,
				numericInput: form.settings.numericInput,
				focusOnError: form.settings.focusOnError,
				validationMethod: form.settings.validationMethod,
				asyncValidation: form.settings.asyncValidation,
				preferredSchema: form.settings.preferredSchema,
				preferredFramework: form.settings.preferredFramework,
				preferredPackageManager: form.settings.preferredPackageManager,
				isCodeSidebarOpen: form.settings.isCodeSidebarOpen,
			})),
		);
		// Return the first (and only) form's settings, or defaults if no settings exist
		return data?.[0] || defaultSettings;
	});

export default useSettings;
