import { createIsomorphicFn } from "@tanstack/react-start";
import type { SettingsCollection } from "@/db-collections/settings.collections";
import { settingsCollection } from "@/db-collections/settings.collections";

const SETTINGS_ID = "user-settings";

const DEFAULT_SETTINGS: SettingsCollection = {
	id: "user-settings",
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
	autoSave: true,
};

// ============================================================================
// Query Operations
// ============================================================================

/**
 * Get all settings
 */
export const getSettings = (): SettingsCollection | null => {
	try {
		return settingsCollection.get(SETTINGS_ID) || null;
	} catch (error) {
		console.error("Failed to get settings:", error);
		return null;
	}
};

/**
 * Get a specific setting by key
 */
export const getSetting = <K extends keyof SettingsCollection>(
	key: K,
): SettingsCollection[K] | null => {
	try {
		const settings = getSettings();
		return settings?.[key] ?? null;
	} catch (error) {
		console.error(`Failed to get setting ${key}:`, error);
		return null;
	}
};

/**
 * Check if settings exist
 */
export const hasSettings = (): boolean => {
	try {
		return settingsCollection.has(SETTINGS_ID);
	} catch (error) {
		console.error("Failed to check settings existence:", error);
		return false;
	}
};

// ============================================================================
// Update Operations
// ============================================================================

/**
 * Update a single setting
 */
export const updateSetting = <K extends keyof SettingsCollection>(
	key: K,
	value: SettingsCollection[K],
): boolean => {
	try {
		settingsCollection.update(SETTINGS_ID, (draft) => {
			draft[key] = value;
		});
		return true;
	} catch (error) {
		console.error(`Failed to update setting ${key}:`, error);
		return false;
	}
};

/**
 * Update multiple settings at once
 */
export const updateSettings = (
	settings: Partial<SettingsCollection>,
): boolean => {
	try {
		settingsCollection.update(SETTINGS_ID, (draft) => {
			Object.assign(draft, settings);
		});
		return true;
	} catch (error) {
		console.error("Failed to update settings:", error);
		return false;
	}
};

/**
 * Reset settings to defaults
 */
export const resetSettings = (): boolean => {
	try {
		return updateSettings(DEFAULT_SETTINGS);
	} catch (error) {
		console.error("Failed to reset settings:", error);
		return false;
	}
};

// ============================================================================
// Specific Setting Operations
// ============================================================================

/**
 * Set active tab
 */
export const setActiveTab = (
	tab: "builder" | "template" | "settings",
): boolean => {
	return updateSetting("activeTab", tab);
};

/**
 * Set preferred framework
 */
export const setPreferredFramework = (
	framework: "react" | "vue" | "angular" | "solid",
): boolean => {
	return updateSetting("preferredFramework", framework);
};

/**
 * Set preferred schema
 */
export const setPreferredSchema = (
	schema: "zod" | "valibot" | "arktype",
): boolean => {
	return updateSetting("preferredSchema", schema);
};

/**
 * Set preferred package manager
 */
export const setPreferredPackageManager = (
	manager: "pnpm" | "npm" | "yarn" | "bun",
): boolean => {
	return updateSetting("preferredPackageManager", manager);
};

/**
 * Update validation-related settings
 */
export const setValidationSettings = (settings: {
	defaultRequiredValidation?: boolean;
	numericInput?: boolean;
	focusOnError?: boolean;
	validationMethod?: "onChange" | "onBlur" | "onDynamic";
	asyncValidation?: number;
	preferredSchema?: "zod" | "valibot" | "arktype";
	preferredFramework?: "react" | "vue" | "angular" | "solid";
}): boolean => {
	return updateSettings(settings);
};

/**
 * Set code sidebar open state
 */
export const setCodeSidebarOpen = (open: boolean): boolean => {
	return updateSetting("isCodeSidebarOpen", open);
};

/**
 * Set auto save state
 */
export const setAutoSave = (enabled: boolean): boolean => {
	return updateSetting("autoSave", enabled);
};

/**
 * Set default required validation
 */
export const setDefaultRequiredValidation = (enabled: boolean): boolean => {
	return updateSetting("defaultRequiredValidation", enabled);
};

/**
 * Set numeric input
 */
export const setNumericInput = (enabled: boolean): boolean => {
	return updateSetting("numericInput", enabled);
};

/**
 * Set focus on error
 */
export const setFocusOnError = (enabled: boolean): boolean => {
	return updateSetting("focusOnError", enabled);
};

/**
 * Set validation method
 */
export const setValidationMethod = (
	method: "onChange" | "onBlur" | "onDynamic",
): boolean => {
	return updateSetting("validationMethod", method);
};

/**
 * Set async validation delay
 */
export const setAsyncValidation = (delay: number): boolean => {
	return updateSetting("asyncValidation", delay);
};

// ============================================================================
// Initialization
// ============================================================================

/**
 * Initialize settings with defaults if they don't exist
 */
export const initializeSettings = createIsomorphicFn()
	.server((): boolean => {
		return true;
	})
	.client((): boolean => {
		try {
			// Check if settings already exist
			if (hasSettings()) {
				return true;
			}

			// Initialize with defaults
			settingsCollection.insert([DEFAULT_SETTINGS]);
			return true;
		} catch (error) {
			console.error("Failed to initialize settings:", error);
			return false;
		}
	})();
