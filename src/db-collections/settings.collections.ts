import {
	createCollection,
	localStorageCollectionOptions
} from "@tanstack/react-db";
import * as v from "valibot";

export const SettingsSchema = v.object({
	id: v.optional(v.string(), "user-settings"),
	defaultRequiredValidation: v.optional(v.boolean(), true),
	numericInput: v.optional(v.boolean(), false),
	focusOnError: v.optional(v.boolean(), true),
	validationMethod: v.optional(
		v.picklist(["onChange", "onBlur", "onDynamic"]),
		"onDynamic",
	),
	asyncValidation: v.optional(
		v.pipe(v.number(), v.minValue(0), v.maxValue(10000)),
		500,
	),
	activeTab: v.optional(
		v.picklist(["builder", "template", "settings"]),
		"builder",
	),
	preferredSchema: v.optional(v.picklist(["zod", "valibot", "arktype"]), "zod"),
	preferredFramework: v.optional(
		v.picklist(["react", "vue", "angular", "solid"]),
		"react",
	),
	preferredPackageManager: v.optional(
		v.picklist(["pnpm", "npm", "yarn", "bun"]),
		"pnpm",
	),
	isCodeSidebarOpen: v.optional(v.boolean(), false),
	autoSave: v.optional(v.boolean(), true),
});

type SettingsCollection = v.InferInput<typeof SettingsSchema>;
type PreferredSchema = v.InferInput<typeof SettingsSchema>["preferredSchema"];
type PreferredFramework = v.InferInput<
	typeof SettingsSchema
>["preferredFramework"];
type ValidationMethod = v.InferInput<typeof SettingsSchema>["validationMethod"];

export type {
	PreferredFramework, PreferredSchema, SettingsCollection, ValidationMethod
};

// const settingsCollection = createIsomorphicFn()
// 	.client(() =>
// 		createCollection(
// 			localStorageCollectionOptions({
// 				storageKey: "settings",
// 				getKey: (settings) => settings.id,
// 				schema: SettingsSchema,
// 			}),
// 		),
// 	)
// 	.server(() =>
// 		createCollection(
// 			localOnlyCollectionOptions({
// 				schema: SettingsSchema,
// 				getKey: (settings) => settings.id,
// 			}),
// 		),
// 	)();

const settingsCollection =createCollection(
	localStorageCollectionOptions({
		storageKey: "settings",
		getKey: (settings) => settings.id,
		schema: SettingsSchema,
	}),
);

export { settingsCollection };
