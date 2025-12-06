import { useLiveQuery } from "@tanstack/react-db";
import { createIsomorphicFn } from "@tanstack/react-start";
import {
	type SettingsCollection,
	settingsCollection,
} from "@/db-collections/settings.collections";

const defaultSettings: SettingsCollection = {
	activeTab: "builder",
	defaultRequiredValidation: true,
	numericInput: false,
	focusOnError: true,
	validationMethod: "onDynamic",
	asyncValidation: 300,
	id: "user-settings",
	preferredSchema: "zod",
	preferredFramework: "react",
	preferredPackageManager: "pnpm",
	isCodeSidebarOpen: false,
	autoSave: true,
};

const useSettings = createIsomorphicFn()
	.server((): SettingsCollection => {
		return defaultSettings;
	})
	.client((): SettingsCollection => {
		const { data } = useLiveQuery((q) =>
			q.from({ settings: settingsCollection }).select(({ settings }) => ({
				activeTab: settings.activeTab,
				defaultRequiredValidation: settings.defaultRequiredValidation,
				numericInput: settings.numericInput,
				focusOnError: settings.focusOnError,
				validationMethod: settings.validationMethod,
				asyncValidation: settings.asyncValidation,
				id: settings.id,
				preferredSchema: settings.preferredSchema,
				preferredFramework: settings.preferredFramework,
				preferredPackageManager: settings.preferredPackageManager,
				isCodeSidebarOpen: settings.isCodeSidebarOpen,
				autoSave: settings.autoSave,
			})),
		);

		// Return the first (and only) settings object, or null if no settings exist
		return data?.[0] || defaultSettings;
	});

export default useSettings;
