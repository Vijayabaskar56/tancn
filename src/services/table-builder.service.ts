/** biome-ignore-all lint/complexity/noStaticOnlyClass: it's alright */
import { DEFAULT_TABLE_COLUMNS, DEFAULT_TABLE_DATA } from "@/constants/default-table-data";
import { getStaticData } from "@/constants/static-dummy-data";
import { tableTemplates } from "@/constants/table-templates";
import {
	type SavedTableTemplate,
	type TableBuilder,
	tableBuilderCollection,
} from "@/db-collections/table-builder.collections";
import { detectColumns } from "@/lib/table-generator/generate-columns";
import type { ColumnConfig, DataRow } from "@/types/table-types";

/**
 * Centralized service for all table builder operations
 * Provides consistent error handling, validation, and API for table operations
 */
export class TableBuilderService {
	private static readonly TABLE_ID = 1;

	// ============================================================================
	// Query Operations
	// ============================================================================

	/**
	 * Get the current table data and settings
	 */
	static getTableData(): TableBuilder | null {
		try {
			return tableBuilderCollection.get(TableBuilderService.TABLE_ID) || null;
		} catch (error) {
			console.error("Failed to get table data:", error);
			return null;
		}
	}

	/**
	 * Get table settings only
	 */
	static getSettings() {
		try {
			const data = TableBuilderService.getTableData();
			return data?.settings || null;
		} catch (error) {
			console.error("Failed to get table settings:", error);
			return null;
		}
	}

	/**
	 * Get table columns only
	 */
	static getColumns(): ColumnConfig[] {
		try {
			const data = TableBuilderService.getTableData();
			return data?.table.columns || [];
		} catch (error) {
			console.error("Failed to get table columns:", error);
			return [];
		}
	}

	/**
	 * Get table data rows only
	 */
	static getData(): DataRow[] {
		try {
			const data = TableBuilderService.getTableData();
			return data?.table.data || [];
		} catch (error) {
			console.error("Failed to get table data:", error);
			return [];
		}
	}

	// ============================================================================
	// Settings Operations
	// ============================================================================

	/**
	 * Update a single setting
	 */
	static updateSetting(
		key: keyof TableBuilder["settings"],
		value: boolean,
	): boolean {
		try {
			tableBuilderCollection.update(TableBuilderService.TABLE_ID, (draft) => {
				if (!draft.settings) {
					draft.settings = {
						isGlobalSearch: false,
						enableHiding: false,
						enableSorting: false,
						enableResizing: false,
						enablePinning: false,
						enableRowSelection: false,
						enableCRUD: false,
						enableColumnDragging: false,
						enableRowDragging: false,
						enablePagination: false,
						tableLayout: {
							dense: false,
							cellBorder: false,
							rowBorder: true,
							rowRounded: false,
							stripped: false,
							headerBorder: true,
							headerSticky: false,
							width: "fixed",
						},
					};
				}
				draft.settings[key] = value;
			});
			return true;
		} catch (error) {
			console.error(`Failed to update setting ${key}:`, error);
			return false;
		}
	}

	/**
	 * Update a table layout setting
	 */
	static updateTableLayoutSetting(
		key: string,
		value: boolean | string,
	): boolean {
		try {
			tableBuilderCollection.update(TableBuilderService.TABLE_ID, (draft) => {
				if (!draft.settings) {
					draft.settings = {
						isGlobalSearch: false,
						enableHiding: false,
						enableSorting: false,
						enableResizing: false,
						enablePinning: false,
						enableRowSelection: false,
						enableCRUD: false,
						enableColumnDragging: false,
						enableRowDragging: false,
						enablePagination: false,
						enableUrlFiltering: false,
						tableLayout: {
							dense: false,
							cellBorder: false,
							rowBorder: true,
							rowRounded: false,
							stripped: false,
							headerBorder: true,
							headerSticky: false,
							width: "fixed",
						},
					};
				}
				if (!draft.settings.tableLayout) {
					draft.settings.tableLayout = {
						dense: false,
						cellBorder: false,
						rowBorder: true,
						rowRounded: false,
						stripped: false,
						headerBorder: true,
						headerSticky: false,
						width: "fixed",
					};
				}
				(draft.settings.tableLayout as Record<string, boolean | string>)[key] =
					value;
			});
			return true;
		} catch (error) {
			console.error(`Failed to update table layout setting ${key}:`, error);
			return false;
		}
	}

	/**
	 * Update multiple settings at once
	 */
	static updateSettings(settings: Partial<TableBuilder["settings"]>): boolean {
		try {
			tableBuilderCollection.update(TableBuilderService.TABLE_ID, (draft) => {
				if (!draft.settings) {
					draft.settings = {
						isGlobalSearch: false,
						enableHiding: false,
						enableSorting: false,
						enableResizing: false,
						enablePinning: false,
						enableRowSelection: false,
						enableCRUD: false,
						enableColumnDragging: false,
						enableRowDragging: false,
						enablePagination: false,
						enableUrlFiltering: false,
					};
				}
				Object.assign(draft.settings, settings);
				// Enforce mutual exclusion: only one of column dragging or row dragging can be enabled
				if (draft.settings.enableColumnDragging) {
					draft.settings.enableRowDragging = false;
				}
				if (draft.settings.enableRowDragging) {
					draft.settings.enableColumnDragging = false;
				}
			});
			return true;
		} catch (error) {
			console.error("Failed to update settings:", error);
			return false;
		}
	}

	/**
	 * Set table name
	 */
	static setTableName(name: string): boolean {
		try {
			tableBuilderCollection.update(TableBuilderService.TABLE_ID, (draft) => {
				draft.tableName = name;
			});
			return true;
		} catch (error) {
			console.error("Failed to set table name:", error);
			return false;
		}
	}

	/**
	 * Reset settings to defaults
	 */
	static resetSettings(): boolean {
		try {
			return TableBuilderService.updateSettings({
				isGlobalSearch: true,
				enableHiding: true,
				enableSorting: true,
				enableResizing: true,
				enablePinning: true,
				enableRowSelection: false,
				enableCRUD: false,
				enableColumnDragging: false,
				enableRowDragging: false,
				enablePagination: true,
				enableUrlFiltering: false,
				tableLayout: {
					dense: false,
					cellBorder: false,
					rowBorder: true,
					rowRounded: false,
					stripped: false,
					headerBorder: true,
					headerSticky: false,
					width: "fixed",
				},
			});
		} catch (error) {
			console.error("Failed to reset settings:", error);
			return false;
		}
	}

	// ============================================================================
	// Column Operations
	// ============================================================================

	/**
	 * Add data for any columns that are missing data in the table rows
	 */
	static addColumnData(): boolean {
		try {
			tableBuilderCollection.update(TableBuilderService.TABLE_ID, (draft) => {
				const columns = draft.table.columns;
				const data = draft.table.data;

				// Ensure exactly 20 rows exist
				if (data.length === 0) {
					// No existing data, create 20 rows
					const newData = [];
					for (let i = 0; i < 20; i++) {
						const row: DataRow = {};
						for (const col of columns) {
							row[col.id] = getStaticData(col.type, i);
						}
						newData.push(row);
					}
					draft.table.data = newData;
				} else if (data.length < 20) {
					// Add rows to reach exactly 20
					const rowsToAdd = 20 - data.length;
					for (let i = 0; i < rowsToAdd; i++) {
						const row: DataRow = {};
						for (const col of columns) {
							row[col.id] = getStaticData(col.type, data.length + i);
						}
						data.push(row);
					}
				}

				// Ensure all columns have data in all rows
				for (const col of columns) {
					for (let i = 0; i < data.length; i++) {
						if (!(col.id in data[i])) {
							data[i][col.id] = getStaticData(col.type, i);
						}
					}
				}
			});
			return true;
		} catch (error) {
			console.error("Failed to add column data:", error);
			return false;
		}
	}

	/**
	 * Add a new column to the table
	 */
	static addColumn(type: ColumnConfig["type"]): boolean {
		try {
			// Ensure table is initialized
			// TableBuilderService.initializeTable();
			const columnKey = `column_${Date.now()}`;
			const columns = TableBuilderService.getColumns();
			const newColumn: ColumnConfig = {
				id: columnKey,
				accessor: columnKey,
				label: `Column ${columns.length + 1}`,
				type,
				order: columns.length,
				filterable: true,
			};
			tableBuilderCollection.update(TableBuilderService.TABLE_ID, (draft) => {
				draft.table.columns.push(newColumn);
			});
			return true;
		} catch (error) {
			console.error("Failed to add column:", error);
			return false;
		}
	}

	/**
	 * Update an existing column
	 */
	static updateColumn(
		columnId: string,
		updates: Partial<ColumnConfig>,
	): boolean {
		try {
			tableBuilderCollection.update(TableBuilderService.TABLE_ID, (draft) => {
				const columnIndex = draft.table.columns.findIndex(
					(col) => col.id === columnId,
				);
				if (columnIndex !== -1) {
					draft.table.columns[columnIndex] = {
						...draft.table.columns[columnIndex],
						...updates,
					};
				} else {
					throw new Error(`Column with id ${columnId} not found`);
				}
			});
			return true;
		} catch (error) {
			console.error(`Failed to update column ${columnId}:`, error);
			return false;
		}
	}

	/**
	 * Delete a column from the table
	 */
	static deleteColumn(columnId: string): boolean {
		try {
			tableBuilderCollection.update(TableBuilderService.TABLE_ID, (draft) => {
				draft.table.columns = draft.table.columns.filter(
					(col) => col.id !== columnId,
				);
				// Remove column data from all rows
				for (const row of draft.table.data) {
					delete row[columnId];
				}
				// Remove rows that are now empty
				draft.table.data = draft.table.data.filter(
					(row) => Object.keys(row).length > 0,
				);
			});
			return true;
		} catch (error) {
			console.error(`Failed to delete column ${columnId}:`, error);
			return false;
		}
	}
	/**
	 * Reorder columns
	 */
	static reorderColumns(newOrder: ColumnConfig[]): boolean {
		try {
			// Update order property for each column
			const reorderedColumns = newOrder.map((col, index) => ({
				...col,
				order: index,
			}));

			tableBuilderCollection.update(TableBuilderService.TABLE_ID, (draft) => {
				draft.table.columns = reorderedColumns;
			});
			return true;
		} catch (error) {
			console.error("Failed to reorder columns:", error);
			return false;
		}
	}

	// ============================================================================
	// Data Operations
	// ============================================================================

	/**
	 * Import data and automatically detect columns
	 */
	static importData(
		data: DataRow[],
		columns?: import("@/workers/data-processor.worker").Column[],
	): boolean {
		try {
			if (!Array.isArray(data) || data.length === 0) {
				throw new Error("Invalid data: must be a non-empty array");
			}

			let finalColumns: ColumnConfig[];
			if (columns) {
				// Convert worker's Column[] to ColumnConfig[]
				finalColumns = columns.map((col) => ({
					...col,
					filterable: true, // enums are filterable
					hasFacetedFilter: col.type === "enum",
					options: undefined,
					optionsMode: "auto" as const,
					possibleValues: col.possibleValues,
				}));
			} else {
				finalColumns = detectColumns(data);
			}

			tableBuilderCollection.update(TableBuilderService.TABLE_ID, (draft) => {
				draft.table = {
					columns: finalColumns,
					data,
				};
			});
			return true;
		} catch (error) {
			console.error("Failed to import data:", error);
			return false;
		}
	}

	/**
	 * Update table data
	 */
	static updateData(data: DataRow[]): boolean {
		try {
			tableBuilderCollection.update(TableBuilderService.TABLE_ID, (draft) => {
				draft.table.data = data;
			});
			return true;
		} catch (error) {
			console.error("Failed to update data:", error);
			return false;
		}
	}

	/**
	 * Clear all data but keep columns
	 */
	static clearData(): boolean {
		try {
			tableBuilderCollection.update(TableBuilderService.TABLE_ID, (draft) => {
				draft.table.data = [];
			});
			return true;
		} catch (error) {
			console.error("Failed to clear data:", error);
			return false;
		}
	}

	/**
	 * Reset the entire table (clear columns and data)
	 */
	static resetTable(): boolean {
		try {
			tableBuilderCollection.update(TableBuilderService.TABLE_ID, (draft) => {
				draft.table = { data: [], columns: [] };
			});
			return true;
		} catch (error) {
			console.error("Failed to reset table:", error);
			return false;
		}
	}

	// ============================================================================
	// Template Operations
	// ============================================================================

	/**
	 * Apply a template to the table
	 */
	static applyTemplate(templateKey: string): boolean {
		try {
			const template = tableTemplates[templateKey];
			if (!template) {
				throw new Error(`Template ${templateKey} not found`);
			}

			tableBuilderCollection.update(TableBuilderService.TABLE_ID, (draft) => {
				draft.settings = template.settings;
				draft.table = {
					columns: template.columns,
					data: template.sampleData || [],
				};
			});
			return true;
		} catch (error) {
			console.error(`Failed to apply template ${templateKey}:`, error);
			return false;
		}
	}

	// ============================================================================
	// Initialization
	// ============================================================================

	/**
	 * Initialize the table store with defaults
	 */
	static initializeTable(): boolean {
		try {
			if (typeof window === "undefined") {
				return false;
			}

			// Clear old data only if invalid to force re-initialization with new schema
			try {
				const existing = tableBuilderCollection.get(
					TableBuilderService.TABLE_ID,
				);
				if (existing) {
					// Data exists and is valid, no need to initialize
					return true;
				}
			} catch (_error) {
				// Data is invalid or corrupted, clear it
				localStorage.removeItem("table-builder");
			}

			// Initialize with defaults if no valid data exists
			const defaultSettings = {
				isGlobalSearch: true,
				enableHiding: true,
				enableSorting: true,
				enableResizing: true,
				enablePinning: true,
				enableRowSelection: false,
				enableCRUD: false,
				enableColumnDragging: false,
				enableRowDragging: false,
				enablePagination: true,
				enableUrlFiltering: false,
				tableLayout: {
					dense: false,
					cellBorder: false,
					rowBorder: true,
					rowRounded: false,
					stripped: false,
					headerBorder: true,
					headerSticky: false,
					width: "fixed" as const,
				},
			};

			tableBuilderCollection.insert([
				{
					id: TableBuilderService.TABLE_ID,
					tableName : 'draft',
					settings: defaultSettings,
					table: {
						columns: DEFAULT_TABLE_COLUMNS,
						data: DEFAULT_TABLE_DATA,
					},
				},
			]);
			return true;
		} catch (error) {
			console.error("Failed to initialize table:", error);
			return false;
		}
	}

	// ============================================================================
	// Saved Templates Operations
	// ============================================================================

	/**
	 * Save current table as a template
	 */
	static saveTableTemplate(name: string): boolean {
		try {
			if (typeof window === "undefined") return false;

			const currentTable = TableBuilderService.getTableData();
			if (!currentTable) {
				throw new Error("No table data to save");
			}

			// Create a safe key from the name
			const safeKey = `saved-table-template-${name.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase()}`;

			const template: SavedTableTemplate = {
				id: safeKey,
				name,
				data: currentTable,
				createdAt: new Date().toISOString(),
			};

			localStorage.setItem(safeKey, JSON.stringify(template));
			// Dispatch custom event to notify components of template changes
			window.dispatchEvent(new CustomEvent("tableTemplateChanged"));
			return true;
		} catch (error) {
			console.error("Failed to save table template:", error);
			return false;
		}
	}

	/**
	 * Get all saved table templates
	 */
	static getSavedTableTemplates(): SavedTableTemplate[] {
		try {
			if (typeof window === "undefined") return [];

			const templates: SavedTableTemplate[] = [];
			const keys = Object.keys(localStorage);

			for (const key of keys) {
				if (key.startsWith("saved-table-template-")) {
					try {
						const template = JSON.parse(localStorage.getItem(key) || "{}");
						if (template?.id && template.name && template.data) {
							templates.push(template);
						}
					} catch (e) {
						// Skip invalid entries
						console.warn(`Invalid saved template in key ${key}:`, e);
					}
				}
			}

			// Sort by creation date, newest first
			return templates.sort(
				(a, b) =>
					new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
			);
		} catch (error) {
			console.error("Failed to get saved table templates:", error);
			return [];
		}
	}

	/**
	 * Load a saved table template
	 */
	static loadTableTemplate(templateId: string): boolean {
		try {
			if (typeof window === "undefined") return false;

			const templateData = localStorage.getItem(templateId);
			if (!templateData) {
				throw new Error(`Template ${templateId} not found`);
			}

			const template: SavedTableTemplate = JSON.parse(templateData);

			tableBuilderCollection.update(TableBuilderService.TABLE_ID, (draft) => {
				Object.assign(draft, template.data);
			});
			return true;
		} catch (error) {
			console.error(`Failed to load table template ${templateId}:`, error);
			return false;
		}
	}

	/**
	 * Delete a saved table template
	 */
	static deleteTableTemplate(templateId: string): boolean {
		try {
			if (typeof window === "undefined") return false;

			localStorage.removeItem(templateId);
			// Dispatch custom event to notify components of template changes
			window.dispatchEvent(new CustomEvent("tableTemplateChanged"));
			return true;
		} catch (error) {
			console.error(`Failed to delete table template ${templateId}:`, error);
			return false;
		}
	}

	// ============================================================================
	// Utility Methods
	// ============================================================================
}
