import {
	createCollection,
	localStorageCollectionOptions
} from "@tanstack/react-db";
import * as v from "valibot";

export const TableBuilderSchema = v.object({
	id: v.number(),
	tableName: v.optional(v.string(), "draft"),
	settings: v.object({
		isGlobalSearch: v.optional(v.boolean(), false),
		enableHiding: v.optional(v.boolean(), false),
		enableSorting: v.optional(v.boolean(), false),
		enableResizing: v.optional(v.boolean(), false),
		enablePinning: v.optional(v.boolean(), false),
		enableRowSelection: v.optional(v.boolean(), false),
		enableCRUD: v.optional(v.boolean(), false),
		enableColumnDragging: v.optional(v.boolean(), false),
		enableRowDragging: v.optional(v.boolean(), false),
		enablePagination: v.optional(v.boolean(), true),
		enableColumnMovable: v.optional(v.boolean(), false),
		enableUrlFiltering: v.optional(v.boolean(), false),
		tableLayout: v.optional(
			v.object({
				dense: v.optional(v.boolean(), false),
				cellBorder: v.optional(v.boolean(), false),
				rowBorder: v.optional(v.boolean(), true),
				rowRounded: v.optional(v.boolean(), false),
				stripped: v.optional(v.boolean(), false),
				headerBorder: v.optional(v.boolean(), true),
				headerSticky: v.optional(v.boolean(), false),
				width: v.optional(
					v.union([v.literal("auto"), v.literal("fixed")]),
					"fixed",
				),
			}),
			{},
		),
	}),
	table: v.object({
		columns: v.array(
			v.object({
				id: v.string(),
				accessor: v.string(),
				label: v.string(),
				type: v.union([
					v.literal("string"),
					v.literal("number"),
					v.literal("boolean"),
					v.literal("date"),
					v.literal("object"),
					v.literal("array"),
					v.literal("enum"),
					v.literal("email"),
					v.literal("url"),
					v.literal("tel"),
					v.literal("time"),
					v.literal("datetime"),
				]),
				order: v.number(),
				filterable: v.optional(v.boolean(), false),
				hasFacetedFilter: v.optional(v.boolean(), false),
				options: v.optional(
					v.array(
						v.object({
							label: v.string(),
							value: v.string(),
						}),
					),
					undefined,
				),
				optionsMode: v.optional(
					v.union([v.literal("auto"), v.literal("custom")]),
					"auto",
				),
				possibleValues: v.optional(v.array(v.string()), undefined),
			}),
		),
		data: v.array(v.record(v.string(), v.any())),
	}),
});

export type TableBuilder = v.InferOutput<typeof TableBuilderSchema>;

//  const tableBuilderCollection = createIsomorphicFn()
// 	.client(() =>
// 		createCollection(
// 			localStorageCollectionOptions({
// 				storageKey: "table-builder",
// 				getKey: (tableBuilder) => tableBuilder.id,
// 				schema: TableBuilderSchema,
// 			}),
// 		),
// 	)
// 	.server(() =>
// 		createCollection(
// 			localOnlyCollectionOptions({
// 				getKey: (tableBuilder) => tableBuilder.id,
// 				schema: TableBuilderSchema,
// 			}),
// 		),
// 	)();


const tableBuilderCollection = createCollection(
	localStorageCollectionOptions({
		storageKey: "table-builder",
		getKey: (tableBuilder) => tableBuilder.id,
		schema: TableBuilderSchema,
	}),
);

// Schema for saved table templates
export const SavedTableTemplateSchema = v.object({
	id: v.string(),
	name: v.string(),
	data: TableBuilderSchema,
	createdAt: v.string(),
});

export type SavedTableTemplate = v.InferOutput<typeof SavedTableTemplateSchema>;

export { tableBuilderCollection };
